'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api.service';
import { FiLock, FiCreditCard, FiSmartphone, FiCopy } from 'react-icons/fi';
import styles from './checkout.module.css';

let mpInstance;

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, cartItemCount, clearCart } = useCart();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '', lastName: '', cep: '', address: '', number: '',
    complement: '', neighborhood: '', city: '', state: 'SP',
  });
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [cardFormInstance, setCardFormInstance] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  
  // A ref 'shouldProcessPayment' foi removida pois não é mais necessária.

  // Função helper para adicionar logs de debug
  const addDebugLog = (category, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null
    };
    
    console.log(`[${timestamp}] [${category}] ${message}`, data || '');
    setDebugLogs(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    addDebugLog('INIT', 'Componente montado');
    addDebugLog('USER', 'Dados do usuário', { user });
    addDebugLog('CART', 'Itens do carrinho', { cartItems, subtotal, cartItemCount });

    if (typeof window !== 'undefined' && window.MercadoPago) {
      const publicKey = "APP_USR-f643797d-d212-4b29-be56-471031739e1c";
      addDebugLog('MP_INIT', 'Inicializando Mercado Pago SDK', { publicKey });
      
      try {
        mpInstance = new window.MercadoPago(publicKey);
        addDebugLog('MP_INIT', 'Mercado Pago inicializado com sucesso', { mpInstance });
      } catch (error) {
        addDebugLog('MP_INIT_ERROR', 'Erro ao inicializar Mercado Pago', { error: error.message, stack: error.stack });
      }
    } else {
      addDebugLog('MP_INIT_ERROR', 'SDK do Mercado Pago não encontrado no window');
    }

    if (user) {
      setEmail(user.email);
      addDebugLog('USER', 'Email definido do usuário', { email: user.email });
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cartItemCount === 0) {
        addDebugLog('CART', 'Carrinho vazio, redirecionando para loja');
        router.push('/loja');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cartItemCount, router]);

  const total = subtotal + (selectedShipping?.price || 0);

  useEffect(() => {
    addDebugLog('PAYMENT_METHOD', 'Método de pagamento alterado', { paymentMethod, total });

    if (mpInstance && paymentMethod === 'card') {
      addDebugLog('CARDFORM', 'Iniciando configuração do CardForm');

      const cardFormConfig = {
        amount: String(total.toFixed(2)),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do cartão" },
          expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/YY" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "CVC" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome no cartão" },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
          installments: { id: "form-checkout__installments", placeholder: "Parcelas" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número do documento" },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) {
              addDebugLog('CARDFORM_ERROR', 'Erro ao montar formulário', { error });
            } else {
              addDebugLog('CARDFORM', 'Formulário montado com sucesso');
            }
          },
          onError: error => {
            addDebugLog('CARDFORM_ERROR', 'Erro no CardForm', { error });
            setPaymentError("Verifique os dados do seu cartão.");
          },
          onSubmit: (event) => {
            addDebugLog('CARDFORM', 'onSubmit callback triggered (pelo SDK do MP)', { event });
          },
          onFetching: (resource) => {
            addDebugLog('CARDFORM', 'Buscando recurso', { resource });
          },
          // >>>>> MUDANÇA APLICADA AQUI <<<<<
          onCardTokenReceived: (errorData, token) => {
            addDebugLog('CARDFORM', 'Token recebido no callback', { errorData, token });

            if (errorData) {
              addDebugLog('CARDFORM_ERROR', 'Erro ao gerar token', { errorData });
              setPaymentError("Erro ao processar dados do cartão. Verifique as informações.");
              setIsProcessing(false); // Libera o botão em caso de erro
              return; // Para a execução
            }

            if (token) {
              // Se recebemos o token, é porque o usuário clicou para pagar. Processamos imediatamente.
              addDebugLog('CARDFORM', 'Token recebido, iniciando processamento do pagamento');
              
              // O paymentMethodId já foi salvo no estado pelo callback onPaymentMethodsReceived
              processarPagamento(token.token, paymentMethodId);
            }
          },
          onInstallmentsReceived: (error, installments) => {
            addDebugLog('CARDFORM', 'Parcelas recebidas', { error, installments });
          },
          onPaymentMethodsReceived: (error, paymentMethods) => {
            addDebugLog('CARDFORM', 'Métodos de pagamento recebidos', { error, paymentMethods });
            if (!error && paymentMethods && paymentMethods.length > 0) {
              setPaymentMethodId(paymentMethods[0].id);
              addDebugLog('CARDFORM', 'payment_method_id salvo no estado', { payment_method_id: paymentMethods[0].id });
            }
          }
        }
      };

      addDebugLog('CARDFORM', 'Configuração do CardForm', cardFormConfig);

      try {
        const instance = mpInstance.cardForm(cardFormConfig);
        setCardFormInstance(instance);
        addDebugLog('CARDFORM', 'CardForm instance criada', { instance });
      } catch (error) {
        addDebugLog('CARDFORM_ERROR', 'Erro ao criar CardForm instance', { error: error.message, stack: error.stack });
      }
    }
    
    return () => {
      if (cardFormInstance) {
        addDebugLog('CARDFORM', 'Desmontando CardForm');
        cardFormInstance.unmount();
        setCardFormInstance(null);
      }
    };
  }, [paymentMethod, total, mpInstance]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    addDebugLog('FORM', 'Campo de endereço alterado', { name, value });
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCepLookup = async () => {
    const cep = shippingAddress.cep.replace(/\D/g, '');
    addDebugLog('CEP', 'Buscando CEP', { cep, cepOriginal: shippingAddress.cep });

    if (cep.length !== 8) {
      addDebugLog('CEP_ERROR', 'CEP inválido (não tem 8 dígitos)', { cep, length: cep.length });
      return;
    }

    setLoadingCep(true);
    
    try {
      addDebugLog('CEP', 'Fazendo requisição para ViaCEP', { url: `https://viacep.com.br/ws/${cep}/json/` });
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      addDebugLog('CEP', 'Resposta do ViaCEP', { response: data });

      if (!data.erro) {
        const newAddress = {
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        };
        
        addDebugLog('CEP', 'CEP encontrado, atualizando endereço', newAddress);
        setShippingAddress(prev => ({ ...prev, ...newAddress }));
      } else {
        addDebugLog('CEP_ERROR', 'CEP não encontrado (erro retornado pela API)');
        alert("CEP não encontrado.");
      }
      
      const freteFixo = [{ 
        id: 'frete_fixo_nacional', 
        name: 'Frete Fixo (Brasil)', 
        price: 9.90, 
        delivery: 'Em até 7 dias úteis' 
      }];
      
      addDebugLog('SHIPPING', 'Opções de frete definidas', freteFixo);
      setShippingOptions(freteFixo);
      setSelectedShipping(freteFixo[0]);
      
    } catch (error) {
      addDebugLog('CEP_ERROR', 'Erro na requisição do CEP', { 
        error: error.message, 
        stack: error.stack 
      });
      console.error("Erro ao buscar CEP:", error);
      alert("Não foi possível buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const copyToClipboard = () => {
    addDebugLog('PIX', 'Copiando código PIX para clipboard', { qr_code: pixData.qr_code });
    navigator.clipboard.writeText(pixData.qr_code);
    alert('Código Pix Copiado!');
  };

  // >>>>> MUDANÇA APLICADA AQUI <<<<<
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isProcessing) {
      addDebugLog('SUBMIT', 'Já está processando, ignorando submit');
      return;
    }

    // Validação inicial
    if (!selectedShipping) {
      addDebugLog('SUBMIT_ERROR', 'Frete não selecionado');
      setPaymentError("Por favor, calcule e selecione um método de frete.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    // Se for PIX, processamos diretamente, pois não depende de token.
    if (paymentMethod === 'pix') {
      addDebugLog('SUBMIT', 'Iniciando fluxo de pagamento PIX');
      await processarPagamento(null, null); // Passamos null pois não há token/methodId
    }
    // Se for Cartão, não fazemos NADA aqui.
    // Apenas mantemos isProcessing como true. O formulário, ao ser submetido,
    // fará o SDK do Mercado Pago gerar o token e chamar o callback onCardTokenReceived.
    // É LÁ que o pagamento será processado.
    else if (paymentMethod === 'card') {
      addDebugLog('SUBMIT', 'Aguardando CardForm gerar o token...');
      // A lógica foi movida para o callback 'onCardTokenReceived'
    }
  };

  const processarPagamento = async (token, paymentMethodId) => {
    // A função setIsProcessing(true) foi movida para o handleSubmit para uma resposta visual mais rápida
	
	    try {
      // Criar pedido
      const pedidoPayload = {
        itens: cartItems.map(item => ({ 
          produtoId: item.id, 
          quantidade: item.quantity 
        })),
        enderecoEntrega: shippingAddress,
        freteId: selectedShipping.id,
      };

      addDebugLog('PEDIDO', 'Criando pedido - Payload', pedidoPayload);
      
      const pedidoResponse = await ApiService.post('/pedidos', pedidoPayload);
      
      addDebugLog('PEDIDO', 'Resposta do backend - Pedido criado', { 
        status: pedidoResponse.status,
        data: pedidoResponse.data,
      });
      
      const pedidoId = pedidoResponse.data.id;
      addDebugLog('PEDIDO', 'ID do pedido', { pedidoId });

      if (paymentMethod === 'card') {
        addDebugLog('PAYMENT_CARD', 'Iniciando pagamento com cartão');

        if (!mpInstance) {
          addDebugLog('PAYMENT_CARD_ERROR', 'mpInstance não existe');
          throw new Error("O SDK do Mercado Pago não foi inicializado.");
        }

        const identificationNumber = document.getElementById('form-checkout__identificationNumber')?.value;
        const installments = document.getElementById('form-checkout__installments')?.value;
        const issuer = document.getElementById('form-checkout__issuer')?.value;

        addDebugLog('PAYMENT_CARD', 'Dados coletados do formulário', {
          identificationNumber,
          installments,
          issuer,
          cardToken: token, // Usando o valor do argumento
          paymentMethodId: paymentMethodId // Usando o valor do argumento
        });

        // VALIDAÇÕES antes de enviar
        if (!token) {
          addDebugLog('PAYMENT_CARD_ERROR', 'Token do cartão não foi gerado.');
          throw new Error("Token do cartão não disponível. Tente novamente.");
        }
        if (!paymentMethodId) {
          addDebugLog('PAYMENT_CARD_ERROR', 'payment_method_id não definido!');
          throw new Error("payment_method_id não foi capturado. Aguarde o formulário carregar completamente.");
        }
        if (!issuer) {
          addDebugLog('PAYMENT_CARD_ERROR', 'issuer_id não definido!');
          throw new Error("issuer_id não foi capturado. Verifique o banco emissor do cartão.");
        }

        const paymentPayload = {
          payment_method: 'card',
          pedidoId: pedidoId,
          token: token, // Usar o token passado como argumento
          issuer_id: issuer,
          installments: parseInt(installments),
          payment_method_id: paymentMethodId,
          payer: {
            email: email,
            identification: {
              type: 'CPF', // Sempre CPF para Brasil
              number: identificationNumber,
            },
          },
        };

        addDebugLog('PAYMENT_CARD', 'Enviando pagamento para backend - Payload', paymentPayload);

        const paymentResponse = await ApiService.post('/pagamentos/processar', paymentPayload);
        
        addDebugLog('PAYMENT_CARD', 'Resposta do backend - Pagamento processado', {
          status: paymentResponse.status,
          data: paymentResponse.data,
        });

        if (paymentResponse.data.status === 'approved') {
          addDebugLog('PAYMENT_CARD', 'Pagamento aprovado! Limpando carrinho e redirecionando');
          clearCart();
          router.push(`/compra-confirmada?pedido=${pedidoId}`);
        } else {
          addDebugLog('PAYMENT_CARD_ERROR', 'Pagamento não aprovado', { response: paymentResponse.data });
          throw new Error(`Pagamento recusado: ${paymentResponse.data.status_detail}`);
        }

      } else if (paymentMethod === 'pix') {
        addDebugLog('PAYMENT_PIX', 'Iniciando pagamento com PIX');

        const pixPayload = {
          payment_method: 'pix',
          pedidoId: pedidoId,
        };

        addDebugLog('PAYMENT_PIX', 'Enviando pagamento PIX para backend - Payload', pixPayload);

        const pixResponse = await ApiService.post('/pagamentos/processar', pixPayload);
        
        addDebugLog('PAYMENT_PIX', 'Resposta do backend - PIX gerado', {
          status: pixResponse.status,
          data: pixResponse.data,
        });

        setPixData(pixResponse.data);
        addDebugLog('PAYMENT_PIX', 'Dados PIX salvos no estado', pixResponse.data);
      }

    } catch (error) {
      addDebugLog('SUBMIT_ERROR', 'Erro geral no checkout', {
        message: error.message,
        response: error.response?.data
      });
      console.error("Erro no checkout:", error);
      setPaymentError(error.response?.data?.message || error.message || "Ocorreu um erro inesperado.");
    } finally {
      // Apenas definimos isProcessing como false. A chamada inicial já foi feita no handleSubmit.
      setIsProcessing(false);
      addDebugLog('SUBMIT', 'Processamento finalizado', { isProcessing: false });
    }
  };

  // Console de Debug
  const DebugConsole = () => (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '300px',
      backgroundColor: '#1a1a1a', color: '#00ff00', fontFamily: 'monospace',
      fontSize: '11px', overflowY: 'auto', zIndex: 9999, padding: '10px',
      borderTop: '2px solid #00ff00'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#fff' }}>🐛 DEBUG CONSOLE - Total de logs: {debugLogs.length}</strong>
        <button 
          onClick={() => { console.clear(); setDebugLogs([]); addDebugLog('SYSTEM', 'Logs limpos'); }}
          style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', fontSize: '11px' }}
        >
          Limpar Logs
        </button>
      </div>
      {debugLogs.map((log, index) => (
        <div key={index} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #333' }}>
          <div>
            <span style={{ color: '#888' }}>[{log.timestamp}]</span> {' '}
            <span style={{ color: log.category.includes('ERROR') ? '#ff0000' : '#00ffff', fontWeight: 'bold' }}>
              [{log.category}]
            </span> {' '}
            <span style={{ color: '#ffff00' }}>{log.message}</span>
          </div>
          {log.data && (
            <pre style={{ marginTop: '5px', marginLeft: '20px', color: '#90ee90', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(log.data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );

  if (pixData) {
    return (
      <>
        <main className={styles.main}>
          <div className={styles.pixContainer}>
            <h2>Finalize seu Pagamento com Pix</h2>
            <p>Escaneie o QR Code abaixo com o app do seu banco ou use o código "Copia e Cola".</p>
            <Image src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="PIX QR Code" width={300} height={300} />
            <p>Código Pix:</p>
            <div className={styles.copyPaste}>
              <input type="text" readOnly value={pixData.qr_code} />
              <button onClick={copyToClipboard}><FiCopy /> Copiar</button>
            </div>
            <p className={styles.pixWarning}>O QR Code expira em 30 minutos.</p>
            <button className={styles.submitButton} onClick={() => router.push('/conta/pedidos')}>
              Acompanhar meu Pedido
            </button>
          </div>
        </main>
        <DebugConsole />
      </>
    );
  }

  if (cartItemCount === 0) {
    return (
      <>
        <p>Seu carrinho está vazio. Redirecionando...</p>
        <DebugConsole />
      </>
    );
  }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.formColumn}>
            <form id="form-checkout" onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <h2>Informações de Contato</h2>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" value={email} onChange={(e) => { setEmail(e.target.value); addDebugLog('FORM', 'Email alterado', { email: e.target.value }); }} required />
                </div>
              </div>

              <div className={styles.formSection}>
                <h2>Endereço de Entrega</h2>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="firstName">Nome</label>
                    <input type="text" name="firstName" value={shippingAddress.firstName} onChange={handleAddressChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="lastName">Sobrenome</label>
                    <input type="text" name="lastName" value={shippingAddress.lastName} onChange={handleAddressChange} required />
                  </div>
                </div>
                <div className={styles.cepGroup}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="cep">CEP</label>
                    <input type="text" name="cep" value={shippingAddress.cep} onChange={handleAddressChange} onBlur={handleCepLookup} placeholder="00000-000" required />
                  </div>
                  <button type="button" onClick={handleCepLookup} disabled={loadingCep}>
                    {loadingCep ? 'Buscando...' : 'Buscar Frete'}
                  </button>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="address">Endereço</label>
                  <input type="text" name="address" value={shippingAddress.address} onChange={handleAddressChange} required />
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="number">Número</label>
                    <input type="text" name="number" value={shippingAddress.number} onChange={handleAddressChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="complement">Complemento (opcional)</label>
                    <input type="text" name="complement" value={shippingAddress.complement} onChange={handleAddressChange} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="neighborhood">Bairro</label>
                  <input type="text" name="neighborhood" value={shippingAddress.neighborhood} onChange={handleAddressChange} required />
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="city">Cidade</label>
                    <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="state">Estado</label>
                    <select name="state" value={shippingAddress.state} onChange={handleAddressChange} required>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="BA">Bahia</option>
                    </select>
                  </div>
                </div>
              </div>

              {shippingOptions.length > 0 && (
                <div className={styles.formSection}>
                  <h2>Método de Envio</h2>
                  {shippingOptions.map(opt => (
                    <div key={opt.id} className={`${styles.shippingOption} ${selectedShipping?.id === opt.id ? styles.selected : ''}`} 
                      onClick={() => { setSelectedShipping(opt); addDebugLog('SHIPPING', 'Frete selecionado', opt); }}
                    >
                      <input type="radio" checked={selectedShipping?.id === opt.id} readOnly />
                      <div className={styles.shippingDetails}>
                        <span>{opt.name}</span>
                        <small>{opt.delivery}</small>
                      </div>
                      <span className={styles.shippingPrice}>R$ {opt.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.formSection}>
                <h2>Pagamento</h2>
                <div className={styles.paymentTabs}>
                  <button type="button" className={paymentMethod === 'card' ? styles.activeTab : ''} onClick={() => setPaymentMethod('card')}>
                    <FiCreditCard /> Cartão de Crédito
                  </button>
                  <button type="button" className={paymentMethod === 'pix' ? styles.activeTab : ''} onClick={() => setPaymentMethod('pix')}>
                    <FiSmartphone /> Pix
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className={styles.paymentContent}>
                    <div className={styles.inputGroup}>
                      <label>Número do Cartão</label>
                      <div id="form-checkout__cardNumber" className={styles.mpInput}></div>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label>Validade</label>
                        <div id="form-checkout__expirationDate" className={styles.mpInput}></div>
                      </div>
                      <div className={styles.inputGroup}>
                        <label>CVV</label>
                        <div id="form-checkout__securityCode" className={styles.mpInput}></div>
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Nome no Cartão</label>
                      <input type="text" id="form-checkout__cardholderName" />
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.inputGroup}>
                        <label>Tipo de Documento</label>
                        <select id="form-checkout__identificationType"></select>
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Número do Documento</label>
                        <input type="text" id="form-checkout__identificationNumber" />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Parcelas</label>
                      <select id="form-checkout__installments"></select>
                    </div>
                    <select id="form-checkout__issuer" style={{ display: 'none' }}></select>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className={styles.paymentContent + ' ' + styles.pixContent}>
                    <p>Um QR Code para pagamento será gerado na próxima tela.</p>
                  </div>
                )}
              </div>

              {paymentError && <p className={styles.errorText}>{paymentError}</p>}

              <button type="submit" className={styles.submitButton} disabled={isProcessing || !selectedShipping}>
                <FiLock /> {isProcessing ? 'Processando...' : `Pagar Agora (R$ ${total.toFixed(2).replace('.', ',')})`}
              </button>
            </form>
          </div>

          <div className={styles.summaryColumn}>
            <div className={styles.summaryContent}>
              <h2>Resumo do Pedido</h2>
              <div className={styles.summaryItems}>
                {cartItems.map(item => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div className={styles.itemImage}>
                      <Image src={item.image} alt={item.name} width={64} height={64} />
                      <span className={styles.itemQuantity}>{item.quantity}</span>
                    </div>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Frete</span>
                <span>{selectedShipping ? `R$ ${selectedShipping.price.toFixed(2).replace('.', ',')}` : 'A calcular'}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <DebugConsole />
    </>
  );
}