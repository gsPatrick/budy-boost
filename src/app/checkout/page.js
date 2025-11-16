'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api.service';
import { FiLock, FiCreditCard, FiSmartphone, FiDollarSign, FiCopy } from 'react-icons/fi';
import styles from './checkout.module.css';

let mpInstance;
let cardFormInstance; // Variável para armazenar a instância do cardForm

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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.MercadoPago) {
      // ATENÇÃO: Use sua chave pública real
      const publicKey = "APP_USR-f643797d-d212-4b29-be56-471031739e1c";
      mpInstance = new window.MercadoPago(publicKey);
      console.log('✅ Mercado Pago SDK inicializado');
    }
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (cartItemCount === 0) {
      router.push('/loja');
    }
  }, [cartItemCount, router]);

  const total = subtotal + (selectedShipping?.price || 0);

  useEffect(() => {
    if (mpInstance && paymentMethod === 'card') {
      // Desmonta a instância anterior se existir
      if (cardFormInstance) {
        cardFormInstance.unmount();
      }

      cardFormInstance = mpInstance.cardForm({
        amount: String(total.toFixed(2)),
        iframe: true,
        form: {
          id: 'form-checkout',
          cardNumber: { id: 'form-checkout__cardNumber', placeholder: '0000 0000 0000 0000' },
          expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/YY' },
          securityCode: { id: 'form-checkout__securityCode', placeholder: 'CVC' },
          cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Nome impresso no cartão' },
          issuer: { id: 'form-checkout__issuer' },
          installments: { id: 'form-checkout__installments' },
          identificationType: { id: 'form-checkout__identificationType' },
          identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: 'Número do documento' },
        },
        callbacks: {
          onFormMounted: error => { 
            if (error) {
              console.error('❌ Form Mounted error:', error);
            } else {
              console.log('✅ Formulário de cartão montado');
            }
          },
          onError: error => { 
            setPaymentError("Verifique os dados do seu cartão."); 
            console.error('❌ Card Form Error:', error); 
          },
          onFetching: (resource) => {
            console.log('⏳ Buscando:', resource);
          },
        },
      });
    }
    return () => {
      if (cardFormInstance) {
        cardFormInstance.unmount();
      }
    };
  }, [paymentMethod, total]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCepLookup = async () => {
    const cep = shippingAddress.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setShippingAddress(prev => ({
          ...prev,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        }));
      } else {
        alert("CEP não encontrado.");
      }
      
      const freteFixo = [
        { id: 'frete_fixo_nacional', name: 'Frete Fixo (Brasil)', price: 9.90, delivery: 'Em até 7 dias úteis' },
      ];
      setShippingOptions(freteFixo);
      setSelectedShipping(freteFixo[0]);

    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      alert("Não foi possível buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixData.qr_code);
    alert('Código Pix Copiado!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing || !selectedShipping) {
      if (!selectedShipping) setPaymentError("Por favor, calcule e selecione um método de frete.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      console.log('📦 Criando pedido...');
      const pedidoResponse = await ApiService.post('/pedidos', {
        itens: cartItems.map(item => ({ produtoId: item.id, quantidade: item.quantity })),
        enderecoEntrega: shippingAddress,
        freteId: selectedShipping.id,
      });
      const pedidoId = pedidoResponse.data.id;
      console.log('✅ Pedido criado:', pedidoId);

      if (paymentMethod === 'card' || paymentMethod === 'debit') {
        if (!mpInstance || !cardFormInstance) throw new Error("O SDK do Mercado Pago não foi inicializado ou o formulário não foi montado.");

        console.log('🔐 Criando token do cartão e coletando dados...');
        
        // CORREÇÃO CRÍTICA: Usar a função de submissão do CardForm para obter o token e os dados validados
        const cardFormData = await cardFormInstance.getCardFormData();
        
        const {
          token,
          paymentMethodId,
          issuerId,
          installments,
          identificationNumber,
          identificationType,
        } = cardFormData;

        if (!token) throw new Error("Não foi possível validar seu cartão. Verifique os dados e tente novamente.");
        
        console.log('✅ Token criado:', token);
        console.log('🔍 Dados do cartão validados:', cardFormData);

        // O paymentMethodId e issuerId agora vêm validados do SDK
        const paymentData = {
          payment_method_id: paymentMethodId,
          payment_method: 'card',
          pedidoId: pedidoId,
          token: token,
          issuer_id: issuerId,
          installments: installments,
          transaction_amount: parseFloat(total.toFixed(2)),
          payer: {
            email: email,
            identification: {
              type: identificationType,
              number: identificationNumber,
            },
          },
        };

        console.log('📤 Enviando pagamento para o backend:', paymentData);

        const paymentResponse = await ApiService.post('/pagamentos/processar', paymentData);

        console.log('📥 Resposta do pagamento:', paymentResponse.data);

        if (paymentResponse.data.status === 'approved') {
          console.log('✅ Pagamento aprovado!');
          clearCart();
          router.push(`/compra-confirmada?pedido=${pedidoId}`);
        } else {
          throw new Error(`Pagamento recusado: ${paymentResponse.data.status_detail}`);
        }

      } else if (paymentMethod === 'pix') {
        console.log('📱 Gerando PIX...');
        const pixResponse = await ApiService.post('/pagamentos/processar', {
          payment_method: 'pix',
          pedidoId: pedidoId,
        });
        console.log('✅ PIX gerado:', pixResponse.data);
        setPixData(pixResponse.data);
      }

    } catch (error) {
      console.error("❌ Erro no checkout:", error);
      console.error("❌ Detalhes do erro:", error.response?.data);
      setPaymentError(error.response?.data?.erro || error.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (pixData) {
    return (
      <main className={styles.main}>
        <div className={styles.pixContainer}>
          <h2>Finalize seu Pagamento com Pix</h2>
          <p>Escaneie o QR Code abaixo com o app do seu banco ou use o código "Copia e Cola".</p>
          <Image src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="PIX QR Code" width={300} height={300} />
          <p>Código Pix:</p>
          <div className={styles.copyPaste}><input type="text" readOnly value={pixData.qr_code} /><button onClick={copyToClipboard}><FiCopy /> Copiar</button></div>
          <p className={styles.pixWarning}>O QR Code expira em 30 minutos.</p>
          <button className={styles.submitButton} onClick={() => router.push('/conta/pedidos')}>Acompanhar meu Pedido</button>
        </div>
      </main>
    );
  }

  if (cartItemCount === 0) {
    return <p>Seu carrinho está vazio. Redirecionando...</p>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.formColumn}>
          <form id="form-checkout" onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2>Informações de Contato</h2>
              <div className={styles.inputGroup}><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            </div>
            <div className={styles.formSection}>
              <h2>Endereço de Entrega</h2>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}><label htmlFor="firstName">Nome</label><input type="text" name="firstName" value={shippingAddress.firstName} onChange={handleAddressChange} required /></div>
                <div className={styles.inputGroup}><label htmlFor="lastName">Sobrenome</label><input type="text" name="lastName" value={shippingAddress.lastName} onChange={handleAddressChange} required /></div>
              </div>
              <div className={styles.cepGroup}>
                <div className={styles.inputGroup}><label htmlFor="cep">CEP</label><input type="text" name="cep" value={shippingAddress.cep} onChange={handleAddressChange} onBlur={handleCepLookup} required /></div>
                <button type="button" onClick={handleCepLookup} disabled={loadingCep} className={styles.cepButton}>{loadingCep ? 'Buscando...' : 'Buscar CEP'}</button>
              </div>
              <div className={styles.inputGroup}><label htmlFor="address">Endereço</label><input type="text" name="address" value={shippingAddress.address} onChange={handleAddressChange} required /></div>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}><label htmlFor="number">Número</label><input type="text" name="number" value={shippingAddress.number} onChange={handleAddressChange} required /></div>
                <div className={styles.inputGroup}><label htmlFor="complement">Complemento (Opcional)</label><input type="text" name="complement" value={shippingAddress.complement} onChange={handleAddressChange} /></div>
              </div>
              <div className={styles.inputGroup}><label htmlFor="neighborhood">Bairro</label><input type="text" name="neighborhood" value={shippingAddress.neighborhood} onChange={handleAddressChange} required /></div>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}><label htmlFor="city">Cidade</label><input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required /></div>
                <div className={styles.inputGroup}><label htmlFor="state">Estado</label><input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} required /></div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Opções de Envio</h2>
              {shippingOptions.length > 0 ? (
                <div className={styles.shippingOptions}>
                  {shippingOptions.map(option => (
                    <label key={option.id} className={styles.shippingOption}>
                      <input type="radio" name="shipping" checked={selectedShipping?.id === option.id} onChange={() => setSelectedShipping(option)} />
                      <span>{option.name} - R$ {option.price.toFixed(2)} ({option.delivery})</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p>Preencha o CEP para calcular o frete.</p>
              )}
            </div>

            <div className={styles.formSection}>
              <h2>Método de Pagamento</h2>
              <div className={styles.paymentMethods}>
                <button type="button" className={`${styles.paymentButton} ${paymentMethod === 'card' ? styles.active : ''}`} onClick={() => setPaymentMethod('card')}><FiCreditCard /> Cartão de Crédito</button>
                <button type="button" className={`${styles.paymentButton} ${paymentMethod === 'pix' ? styles.active : ''}`} onClick={() => setPaymentMethod('pix')}><FiSmartphone /> PIX</button>
              </div>

              {paymentMethod === 'card' && (
                <div className={styles.cardFormContainer}>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}><label htmlFor="form-checkout__cardholderName">Nome no Cartão</label><div id="form-checkout__cardholderName" className={styles.mpInput}></div></div>
                    <div className={styles.inputGroup}><label htmlFor="form-checkout__identificationType">Tipo Doc.</label><div id="form-checkout__identificationType" className={styles.mpInput}></div></div>
                  </div>
                  <div className={styles.inputGroup}><label htmlFor="form-checkout__identificationNumber">Número do Documento</label><div id="form-checkout__identificationNumber" className={styles.mpInput}></div></div>
                  <div className={styles.inputGroup}><label htmlFor="form-checkout__cardNumber">Número do Cartão</label><div id="form-checkout__cardNumber" className={styles.mpInput}></div></div>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}><label htmlFor="form-checkout__expirationDate">Vencimento</label><div id="form-checkout__expirationDate" className={styles.mpInput}></div></div>
                    <div className={styles.inputGroup}><label htmlFor="form-checkout__securityCode">CVC</label><div id="form-checkout__securityCode" className={styles.mpInput}></div></div>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}><label htmlFor="form-checkout__issuer">Bandeira</label><div id="form-checkout__issuer" className={styles.mpInput}></div></div>
                    <div className={styles.inputGroup}><label htmlFor="form-checkout__installments">Parcelas</label><div id="form-checkout__installments" className={styles.mpInput}></div></div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.summary}>
              <h3>Resumo do Pedido</h3>
              <p>Subtotal: R$ {subtotal.toFixed(2)}</p>
              <p>Frete: R$ {selectedShipping ? selectedShipping.price.toFixed(2) : '0.00'}</p>
              <p className={styles.total}>Total: R$ {total.toFixed(2)}</p>
            </div>

            {paymentError && <p className={styles.error}>{paymentError}</p>}

            <button type="submit" className={styles.submitButton} disabled={isProcessing || !selectedShipping}>
              {isProcessing ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
            </button>
            <p className={styles.secure}><FiLock /> Transação Segura</p>
          </form>
        </div>
        <div className={styles.cartColumn}>
          {/* Conteúdo do carrinho aqui, se necessário */}
        </div>
      </div>
    </main>
  );
}