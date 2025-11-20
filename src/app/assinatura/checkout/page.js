'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiCreditCard, FiCalendar, FiLock, FiCheck, FiRefreshCw, FiTruck } from 'react-icons/fi';
import ApiService from '../../../services/api.service';
import { useAuth } from '../../../context/AuthContext';
import styles from './subscriptionCheckout.module.css';

export default function SubscriptionCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Ref para guardar a instância do controlador do Brick
  const brickControllerRef = useRef(null);

  // --- 1. Captura Parâmetros da URL ---
  const produtoId = searchParams.get('produtoId');
  const qtdParam = searchParams.get('quantidade') || 1;
  const freqParam = searchParams.get('frequencia') || 30;

  // --- 2. Estados ---
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Configurações da Assinatura
  const [frequency, setFrequency] = useState(freqParam);
  const [quantity, setQuantity] = useState(parseInt(qtdParam));

  // Endereço de Entrega
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // --- 3. Verificação de Autenticação e Carregamento do Produto ---
  useEffect(() => {
    if (!authLoading && !user) {
      const returnUrl = `/assinatura/checkout?produtoId=${produtoId}&quantidade=${quantity}&frequencia=${frequency}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', returnUrl);
      }
      router.push('/conta');
      return;
    }

    const fetchProduct = async () => {
      if (!produtoId) return;
      try {
        const res = await ApiService.get(`/produtos/${produtoId}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os detalhes do produto para assinatura.");
      } finally {
        setLoadingProduct(false);
      }
    };

    if (user) {
      fetchProduct();
    }
  }, [produtoId, user, authLoading, router, quantity, frequency]);

  // --- 4. Inicialização do Mercado Pago Brick (Lógica Robusta) ---
  useEffect(() => {
    // Condições de saída
    if (!product || !user || typeof window === 'undefined' || !window.MercadoPago) {
      return;
    }

    const renderBrick = async () => {
      try {
        // 1. Limpeza Profunda: Remove qualquer instância anterior e limpa o HTML
        if (brickControllerRef.current) {
            try {
                await brickControllerRef.current.unmount();
            } catch (e) { console.warn("Erro ao desmontar brick anterior:", e); }
            brickControllerRef.current = null;
        }
        
        const container = document.getElementById('cardPaymentBrick_container');
        if (container) {
            container.innerHTML = ''; // Remove "fantasmas" HTML
        }

        // 2. Configuração
        const mp = new window.MercadoPago("APP_USR-f643797d-d212-4b29-be56-471031739e1c"); // Sua Public Key
        const bricksBuilder = mp.bricks();
        const totalAmount = parseFloat(product.preco) * quantity;

        const settings = {
          initialization: {
            amount: totalAmount,
            payer: {
              email: user.email,
            },
          },
          customization: {
            visual: {
              style: { theme: 'default' },
              hidePaymentButton: false,
            },
            paymentMethods: {
              maxInstallments: 1,
              paymentMethods: {
                 ticket: "excluded",
                 bankTransfer: "excluded",
                 creditCard: "all",
                 debitCard: "all"
              }
            },
          },
          callbacks: {
            onReady: () => {
              console.log("Brick de assinatura pronto.");
            },
            onSubmit: async (cardFormData) => {
               // Validação de endereço
               if (!address.cep || !address.address || !address.number) {
                 setError("Por favor, preencha o endereço de entrega completo.");
                 return Promise.reject("Endereço incompleto");
               }

               setProcessing(true);
               setError(null);

               try {
                  const payload = {
                      produtoId: product.id,
                      token: cardFormData.token,
                      frequencia: frequency,
                      quantidade: quantity,
                      enderecoEntrega: address,
                      payment_method_id: cardFormData.payment_method_id,
                      issuer_id: cardFormData.issuer_id,
                      payer: cardFormData.payer
                  };

                  const response = await ApiService.criarAssinatura(payload);
                  
                  if (response.data.status === 'authorized' || response.data.status === 'approved') {
                      alert("Assinatura realizada com sucesso! Bem-vindo ao clube.");
                      router.push('/conta/assinaturas');
                  } else {
                      throw new Error("O pagamento não foi autorizado pela operadora.");
                  }

               } catch (err) {
                   console.error(err);
                   const msg = err.response?.data?.erro || err.message || "Erro ao processar assinatura.";
                   setError(msg);
                   setProcessing(false);
                   throw err;
               }
            },
            onError: (error) => {
              console.error(error);
              setError("Erro nos dados do cartão. Verifique e tente novamente.");
            },
          },
        };
        
        // 3. Criação do Brick
        const controller = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
        brickControllerRef.current = controller;
      
      } catch (e) {
        console.error("Erro fatal ao iniciar Brick:", e);
      }
    };

    // Pequeno timeout para garantir que o DOM está pronto e limpo
    const timer = setTimeout(() => {
        renderBrick();
    }, 100);

    // Cleanup: roda quando o componente desmonta ou quando user/product mudam
    return () => {
        clearTimeout(timer);
        if (brickControllerRef.current) {
            brickControllerRef.current.unmount().catch(() => {});
            brickControllerRef.current = null;
        }
    };
  }, [product, quantity, user]); // Removemos 'frequency' das dependências para não recarregar o brick ao mudar o select

  // --- 5. Busca de CEP ---
  const handleCepBlur = async (e) => {
      const cep = e.target.value.replace(/\D/g, '');
      if(cep.length === 8) {
          try {
              const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
              const data = await res.json();
              if(!data.erro) {
                  setAddress(prev => ({
                      ...prev, 
                      address: data.logradouro, 
                      neighborhood: data.bairro, 
                      city: data.localidade, 
                      state: data.uf
                  }));
              } else {
                  alert("CEP não encontrado.");
              }
          } catch(e){
              console.error("Erro no CEP", e);
          }
      }
  };

  // --- 6. Renderização ---

  if (authLoading || loadingProduct) {
      return (
          <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Carregando dados da assinatura...</p>
          </div>
      );
  }

  if (!product) {
      return (
          <div className={styles.errorContainer}>
              <h2>Produto não encontrado</h2>
              <button onClick={() => router.push('/loja')} className={styles.backButton}>Voltar para Loja</button>
          </div>
      );
  }

  const total = (parseFloat(product.preco) * quantity).toFixed(2).replace('.', ',');

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h1>Finalizar Assinatura</h1>
          <div className={styles.secureBadge}>
              <FiLock size={18} /> Ambiente Seguro SSL
          </div>
        </div>

        <div className={styles.grid}>
            {/* --- COLUNA ESQUERDA: DADOS --- */}
            <div className={styles.leftColumn}>
                
                {/* CARD 1: ENDEREÇO */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.stepNumber}>1</span>
                        <h2>Endereço de Entrega Recorrente</h2>
                    </div>
                    <p className={styles.cardSub}>Este endereço será utilizado para todos os envios automáticos.</p>
                    
                    <form className={styles.form}>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Nome</label>
                                <input 
                                    value={address.firstName} 
                                    onChange={e => setAddress({...address, firstName: e.target.value})} 
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Sobrenome</label>
                                <input 
                                    value={address.lastName} 
                                    onChange={e => setAddress({...address, lastName: e.target.value})} 
                                    placeholder="Sobrenome"
                                />
                            </div>
                        </div>
                        
                        <div className={styles.row}>
                             <div className={styles.inputGroup}>
                                <label>CEP</label>
                                <input 
                                    value={address.cep} 
                                    onChange={e => setAddress({...address, cep: e.target.value})} 
                                    onBlur={handleCepBlur} 
                                    placeholder="00000-000"
                                    maxLength={9}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Número</label>
                                <input 
                                    value={address.number} 
                                    onChange={e => setAddress({...address, number: e.target.value})} 
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Endereço</label>
                            <input 
                                value={address.address} 
                                onChange={e => setAddress({...address, address: e.target.value})} 
                                placeholder="Rua, Avenida..."
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Bairro</label>
                                <input 
                                    value={address.neighborhood} 
                                    onChange={e => setAddress({...address, neighborhood: e.target.value})} 
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Cidade</label>
                                <input value={address.city} readOnly className={styles.readOnly} />
                            </div>
                            <div className={styles.inputGroup} style={{flex: '0 0 60px'}}>
                                <label>UF</label>
                                <input value={address.state} readOnly className={styles.readOnly} />
                            </div>
                        </div>
                    </form>
                </div>

                {/* CARD 2: PAGAMENTO */}
                <div className={styles.card}>
                     <div className={styles.cardHeader}>
                        <span className={styles.stepNumber}>2</span>
                        <h2>Pagamento Seguro</h2>
                    </div>
                    <p className={styles.cardSub}>
                        <FiCreditCard style={{marginRight: 5, position: 'relative', top: 2}}/> 
                        Apenas Cartão de Crédito é aceito para assinaturas.
                    </p>

                    {/* Container do Brick do Mercado Pago */}
                    <div className={styles.paymentContainer}>
                        <div id="cardPaymentBrick_container"></div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {processing && (
                        <div className={styles.processingMessage}>
                            <div className={styles.spinnerSmall}></div> Processando assinatura...
                        </div>
                    )}
                </div>

            </div>

            {/* --- COLUNA DIREITA: RESUMO --- */}
            <div className={styles.rightColumn}>
                <div className={styles.summaryCard}>
                    <h3>Resumo da Assinatura</h3>
                    
                    <div className={styles.productResume}>
                         <div className={styles.imageWrapper}>
                            <Image 
                                src={product.imagens?.[0] || '/placeholder-produto.png'} 
                                alt={product.nome} 
                                width={70} 
                                height={70} 
                                style={{objectFit: 'contain'}}
                            />
                         </div>
                         <div className={styles.productInfo}>
                             <h4>{product.nome}</h4>
                             <span>Quantidade: {quantity}</span>
                         </div>
                    </div>

                    <div className={styles.configSection}>
                        <label><FiRefreshCw /> Frequência de Envio:</label>
                        <select 
                            value={frequency} 
                            onChange={(e) => setFrequency(e.target.value)}
                            className={styles.frequencySelect}
                        >
                            <option value="30">A cada 30 dias (Mensal)</option>
                            <option value="60">A cada 60 dias (Bimestral)</option>
                            <option value="90">A cada 90 dias (Trimestral)</option>
                        </select>
                        <small>Você receberá uma nova remessa e será cobrado automaticamente a cada {frequency} dias.</small>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>R$ {total}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Frete Assinatura</span>
                            <span style={{color: '#16a34a'}}>Grátis</span>
                        </div>
                        <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                            <span>Total Recorrente</span>
                            <span>R$ {total}</span>
                        </div>
                    </div>

                    <div className={styles.recurrenceAlert}>
                        <FiCalendar /> Próxima cobrança em {frequency} dias.
                    </div>

                    <ul className={styles.benefitsList}>
                        <li><FiCheck color="#16a34a"/> <strong>Economia garantida</strong> em cada envio</li>
                        <li><FiCheck color="#16a34a"/> <strong>Cancele online</strong> a qualquer momento</li>
                        <li><FiTruck color="#16a34a"/> <strong>Prioridade</strong> no envio</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}