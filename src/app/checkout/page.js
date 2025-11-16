'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    console.log("DEBUG: Efeito de inicialização do MP disparado.");
    if (typeof window !== 'undefined' && window.MercadoPago) {
      const publicKey = "APP_USR-f643797d-d212-4b29-be56-471031739e1c";
      console.log("DEBUG: Chave pública definida:", publicKey);
      mpInstance = new window.MercadoPago(publicKey);
      console.log("DEBUG: Instância do Mercado Pago criada:", mpInstance);
    } else {
      console.error("DEBUG: Objeto window.MercadoPago não encontrado!");
    }
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (cartItemCount === 0) {
            router.push('/loja');
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [cartItemCount, router]);

  const total = subtotal + (selectedShipping?.price || 0);

  useEffect(() => {
    console.log("DEBUG: Efeito de montagem do CardForm disparado.");
    if (mpInstance && paymentMethod === 'card') {
      console.log("DEBUG: Condições atendidas. Montando CardForm...");
      const instance = mpInstance.cardForm({
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
            if (error) return console.error("DEBUG: Erro ao montar formulário:", error);
            console.log("DEBUG: Formulário do cartão montado com sucesso.");
          },
          onError: error => { 
            setPaymentError("Verifique os dados do seu cartão."); 
            console.error("DEBUG: Erro no CardForm (callback onError):", error);
          },
        }
      });
      setCardFormInstance(instance);
    }
    
    return () => {
      if (cardFormInstance) {
        console.log("DEBUG: Desmontando instância do CardForm.");
        cardFormInstance.unmount();
        setCardFormInstance(null);
      }
    };
  }, [paymentMethod, total, mpInstance]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCepLookup = async () => { /* ... (sem alterações) ... */ };
  const copyToClipboard = () => { /* ... (sem alterações) ... */ };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("DEBUG: Botão 'Pagar Agora' clicado. Iniciando handleSubmit.");
    if (isProcessing || !selectedShipping) {
      if (!selectedShipping) setPaymentError("Por favor, calcule e selecione um método de frete.");
      return;
    }
    setIsProcessing(true);
    setPaymentError(null);

    try {
      console.log("DEBUG: 1. Criando pedido no backend...");
      const pedidoResponse = await ApiService.post('/pedidos', {
        itens: cartItems.map(item => ({ produtoId: item.id, quantidade: item.quantity })),
        enderecoEntrega: shippingAddress,
        freteId: selectedShipping.id,
      });
      const pedidoId = pedidoResponse.data.id;
      console.log("DEBUG: Pedido criado com sucesso. ID:", pedidoId);

      if (paymentMethod === 'card') {
        console.log("DEBUG: 2. Método de pagamento é 'card'.");
        if (!mpInstance) throw new Error("O SDK do Mercado Pago não foi inicializado.");

        console.log("DEBUG: 3. Chamando createCardToken...");
        const cardToken = await mpInstance.createCardToken({
          cardholderName: document.getElementById('form-checkout__cardholderName').value,
          identificationType: document.getElementById('form-checkout__identificationType').value,
          identificationNumber: document.getElementById('form-checkout__identificationNumber').value,
        });
        
        console.log("DEBUG: 4. Resposta de createCardToken:", JSON.stringify(cardToken, null, 2));
        
        if (!cardToken || !cardToken.id) {
          throw new Error("Não foi possível gerar o token do cartão. Verifique os dados e tente novamente.");
        }

        const payloadParaBackend = {
          payment_method: 'card',
          pedidoId: pedidoId,
          token: cardToken.id,
          issuer_id: cardToken.issuer_id,
          installments: parseInt(document.getElementById('form-checkout__installments').value),
          payment_method_id: cardToken.payment_method_id,
          payer: {
            email: email,
            identification: {
              type: cardToken.cardholder.identification.type,
              number: cardToken.cardholder.identification.number,
            },
          },
        };

        console.log("DEBUG: 5. Payload que será enviado para o backend:", JSON.stringify(payloadParaBackend, null, 2));

        const paymentResponse = await ApiService.post('/pagamentos/processar', payloadParaBackend);
        console.log("DEBUG: 6. Resposta do backend:", paymentResponse.data);

        if (paymentResponse.data.status === 'approved') {
          clearCart();
          router.push(`/compra-confirmada?pedido=${pedidoId}`);
        } else {
          throw new Error(`Pagamento recusado: ${paymentResponse.data.status_detail}`);
        }

      } else if (paymentMethod === 'pix') {
        // ... (lógica do pix)
      }
    } catch (error) {
      console.error("DEBUG: Erro final no bloco catch do handleSubmit:", error);
      setPaymentError(error.message || "Ocorreu um erro inesperado.");
    } finally {
      console.log("DEBUG: Finalizando handleSubmit (bloco finally).");
      setIsProcessing(false);
    }
  };

  // O resto do arquivo (renderização) permanece exatamente o mesmo.
  // ... (código JSX para pixData, cartItemCount === 0, e o formulário principal)
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
                <div className={styles.inputGroup}><label htmlFor="cep">CEP</label><input type="text" name="cep" value={shippingAddress.cep} onChange={handleAddressChange} onBlur={handleCepLookup} placeholder="00000-000" required /></div>
                <button type="button" onClick={handleCepLookup} disabled={loadingCep}>{loadingCep ? 'Buscando...' : 'Buscar Frete'}</button>
              </div>
              <div className={styles.inputGroup}><label htmlFor="address">Endereço</label><input type="text" name="address" value={shippingAddress.address} onChange={handleAddressChange} required /></div>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}><label htmlFor="number">Número</label><input type="text" name="number" value={shippingAddress.number} onChange={handleAddressChange} required /></div>
                <div className={styles.inputGroup}><label htmlFor="complement">Complemento (opcional)</label><input type="text" name="complement" value={shippingAddress.complement} onChange={handleAddressChange} /></div>
              </div>
              <div className={styles.inputGroup}><label htmlFor="neighborhood">Bairro</label><input type="text" name="neighborhood" value={shippingAddress.neighborhood} onChange={handleAddressChange} required /></div>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}><label htmlFor="city">Cidade</label><input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required /></div>
                <div className={styles.inputGroup}><label htmlFor="state">Estado</label><select name="state" value={shippingAddress.state} onChange={handleAddressChange} required><option value="SP">São Paulo</option><option value="RJ">Rio de Janeiro</option><option value="MG">Minas Gerais</option><option value="BA">Bahia</option></select></div>
              </div>
            </div>
            {shippingOptions.length > 0 && (
              <div className={styles.formSection}>
                <h2>Método de Envio</h2>
                {shippingOptions.map(opt => (
                  <div key={opt.id} className={`${styles.shippingOption} ${selectedShipping?.id === opt.id ? styles.selected : ''}`} onClick={() => setSelectedShipping(opt)}>
                    <input type="radio" checked={selectedShipping?.id === opt.id} readOnly />
                    <div className={styles.shippingDetails}><span>{opt.name}</span><small>{opt.delivery}</small></div>
                    <span className={styles.shippingPrice}>R$ {opt.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.formSection}>
              <h2>Pagamento</h2>
              <div className={styles.paymentTabs}>
                <button type="button" className={paymentMethod === 'card' ? styles.activeTab : ''} onClick={() => setPaymentMethod('card')}><FiCreditCard /> Cartão de Crédito</button>
                <button type="button" className={paymentMethod === 'pix' ? styles.activeTab : ''} onClick={() => setPaymentMethod('pix')}><FiSmartphone /> Pix</button>
              </div>
              {paymentMethod === 'card' && (
                <div className={styles.paymentContent}>
                  <div className={styles.inputGroup}><label>Número do Cartão</label><div id="form-checkout__cardNumber" className={styles.mpInput}></div></div>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}><label>Validade</label><div id="form-checkout__expirationDate" className={styles.mpInput}></div></div>
                    <div className={styles.inputGroup}><label>CVV</label><div id="form-checkout__securityCode" className={styles.mpInput}></div></div>
                  </div>
                  <div className={styles.inputGroup}><label>Nome no Cartão</label><input type="text" id="form-checkout__cardholderName" /></div>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}><label>Tipo de Documento</label><select id="form-checkout__identificationType"></select></div>
                    <div className={styles.inputGroup}><label>Número do Documento</label><input type="text" id="form-checkout__identificationNumber" /></div>
                  </div>
                   <div className={styles.inputGroup}><label>Parcelas</label><select id="form-checkout__installments"></select></div>
                   <select id="form-checkout__issuer" style={{ display: 'none' }}></select>
                </div>
              )}
              {paymentMethod === 'pix' && (<div className={styles.paymentContent + ' ' + styles.pixContent}><p>Um QR Code para pagamento será gerado na próxima tela.</p></div>)}
            </div>
            {paymentError && <p className={styles.errorText}>{paymentError}</p>}
            <button type="submit" className={styles.submitButton} disabled={isProcessing || !selectedShipping}><FiLock /> {isProcessing ? 'Processando...' : `Pagar Agora (R$ ${total.toFixed(2).replace('.', ',')})`}</button>
          </form>
        </div>
        <div className={styles.summaryColumn}>
          <div className={styles.summaryContent}>
            <h2>Resumo do Pedido</h2>
            <div className={styles.summaryItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.itemImage}><Image src={item.image} alt={item.name} width={64} height={64} /><span className={styles.itemQuantity}>{item.quantity}</span></div>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                </div>
              ))}
            </div>
            <div className={styles.summaryLine}><span>Subtotal</span><span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
            <div className={styles.summaryLine}><span>Frete</span><span>{selectedShipping ? `R$ ${selectedShipping.price.toFixed(2).replace('.', ',')}` : 'A calcular'}</span></div>
            <div className={styles.summaryTotal}><span>Total</span><span>R$ {total.toFixed(2).replace('.', ',')}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}