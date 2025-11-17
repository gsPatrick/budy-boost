'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api.service';
import { FiLock, FiCreditCard, FiSmartphone, FiCopy } from 'react-icons/fi';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, cartItemCount, clearCart } = useCart();
  const { user } = useAuth();

  // Estados do formulário e UI
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
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

  // Efeito para preencher o e-mail do usuário logado
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Efeito para redirecionar se o carrinho estiver vazio
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cartItemCount === 0) {
        router.push('/loja');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cartItemCount, router]);

  const total = subtotal + (selectedShipping?.price || 0);

  // Função reutilizável para criar o pedido no backend
  const createOrder = async () => {
    if (!selectedShipping) {
      throw new Error("Por favor, calcule e selecione um método de frete.");
    }
    const pedidoResponse = await ApiService.post('/pedidos', {
      itens: cartItems.map(item => ({ produtoId: item.id, quantidade: item.quantity })),
      enderecoEntrega: shippingAddress,
      freteId: selectedShipping.id,
    });
    return pedidoResponse.data.id;
  };

  // Efeito para inicializar e destruir o Payment Brick
  useEffect(() => {
    let brickController;

    const initBrick = async () => {
      if (paymentMethod === 'card' && total > 0 && typeof window !== 'undefined' && window.MercadoPago) {
        try {
          const container = document.getElementById('cardPaymentBrick_container');
          if (container.innerHTML !== '') {
            container.innerHTML = '';
          }

          const publicKey = "APP_USR-f643797d-d212-4b29-be56-471031739e1c";
          const mp = new window.MercadoPago(publicKey);
          const bricksBuilder = mp.bricks();

          const settings = {
            initialization: {
              amount: total,
              payer: {
                email: email || undefined,
              },
            },
            customization: {
              visual: { style: { theme: 'default' } },
              paymentMethods: { creditCard: "all", debitCard: "all" },
            },
            callbacks: {
              onReady: () => {},
              onError: (error) => {
                console.error("[BRICK ERROR]", error);
                setPaymentError("Erro ao processar dados do cartão. Verifique os campos.");
              },
              onSubmit: async (formData) => {
                setIsProcessing(true);
                setPaymentError(null);
                try {
                  const pedidoId = await createOrder();

                  const paymentPayload = {
                    payment_method: 'card',
                    pedidoId: pedidoId,
                    token: formData.token,
                    issuer_id: formData.issuer_id,
                    installments: formData.installments,
                    payment_method_id: formData.payment_method_id,
                    payer: {
                      email: formData.payer.email,
                      identification: formData.payer.identification,
                    },
                  };

                  const paymentResponse = await ApiService.post('/pagamentos/processar', paymentPayload);

                  if (paymentResponse.data.status === 'approved') {
                    clearCart();
                    router.push(`/compra-confirmada?pedido=${pedidoId}`);
                  } else {
                    throw new Error(`Pagamento recusado: ${paymentResponse.data.status_detail}`);
                  }
                } catch (error) {
                  setPaymentError(error.message || "Falha ao finalizar a compra.");
                  setIsProcessing(false);
                }
              },
            },
          };

          brickController = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
        } catch (error) {
          console.error("Falha ao inicializar o Payment Brick:", error);
        }
      }
    };

    initBrick();

    return () => {
      if (brickController) {
        brickController.unmount();
      }
    };
  }, [paymentMethod, total, email]);

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
        setShippingAddress(prev => ({ ...prev, address: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf, }));
      } else { alert("CEP não encontrado."); }
      
      const freteFixo = [{ id: 'frete_fixo_nacional', name: 'Frete Fixo (Brasil)', price: 9.90, delivery: 'Em até 7 dias úteis' }];
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

  const handlePixSubmit = async () => {
    if (isProcessing || !selectedShipping) {
      if (!selectedShipping) setPaymentError("Por favor, calcule e selecione um método de frete.");
      return;
    }
    if (!cpf.replace(/\D/g, '')) {
      setPaymentError("Por favor, preencha seu CPF para gerar o Pix.");
      return;
    }
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const pedidoId = await createOrder();
      const pixResponse = await ApiService.post('/pagamentos/processar', {
        payment_method: 'pix',
        pedidoId: pedidoId,
        payer: {
          identification: {
            type: 'CPF',
            number: cpf,
          }
        }
      });
      setPixData(pixResponse.data);
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
      setPaymentError(error.message || "Ocorreu um erro inesperado.");
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
    return (
        <main className={styles.main}>
            <div className={styles.processingOverlay}>
                <div className={styles.spinner}></div>
                <p>Seu carrinho está vazio. Redirecionando para a loja...</p>
            </div>
        </main>
    );
  }

  return (
    <main className={styles.main}>
      {isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.spinner}></div>
          <p>Processando seu pagamento, por favor aguarde...</p>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.formColumn}>
          <form id="form-checkout">
            <div className={styles.formSection}>
              <h2>Informações de Contato</h2>
              <div className={styles.inputGroup}><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            </div>
            <div className={styles.formSection}>
              <h2>Endereço de Entrega</h2>
              <div className={styles.formGrid}><div className={styles.inputGroup}><label htmlFor="firstName">Nome</label><input type="text" name="firstName" value={shippingAddress.firstName} onChange={handleAddressChange} required /></div><div className={styles.inputGroup}><label htmlFor="lastName">Sobrenome</label><input type="text" name="lastName" value={shippingAddress.lastName} onChange={handleAddressChange} required /></div></div>
              <div className={styles.cepGroup}><div className={styles.inputGroup}><label htmlFor="cep">CEP</label><input type="text" name="cep" value={shippingAddress.cep} onChange={handleAddressChange} onBlur={handleCepLookup} placeholder="00000-000" required /></div><button type="button" onClick={handleCepLookup} disabled={loadingCep}>{loadingCep ? 'Buscando...' : 'Buscar Frete'}</button></div>
              <div className={styles.inputGroup}><label htmlFor="address">Endereço</label><input type="text" name="address" value={shippingAddress.address} onChange={handleAddressChange} required /></div>
              <div className={styles.formGrid}><div className={styles.inputGroup}><label htmlFor="number">Número</label><input type="text" name="number" value={shippingAddress.number} onChange={handleAddressChange} required /></div><div className={styles.inputGroup}><label htmlFor="complement">Complemento (opcional)</label><input type="text" name="complement" value={shippingAddress.complement} onChange={handleAddressChange} /></div></div>
              <div className={styles.inputGroup}><label htmlFor="neighborhood">Bairro</label><input type="text" name="neighborhood" value={shippingAddress.neighborhood} onChange={handleAddressChange} required /></div>
              <div className={styles.formGrid}><div className={styles.inputGroup}><label htmlFor="city">Cidade</label><input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required /></div><div className={styles.inputGroup}><label htmlFor="state">Estado</label><select name="state" value={shippingAddress.state} onChange={handleAddressChange} required><option value="SP">São Paulo</option><option value="RJ">Rio de Janeiro</option><option value="MG">Minas Gerais</option><option value="BA">Bahia</option></select></div></div>
            </div>
            {shippingOptions.length > 0 && (
              <div className={styles.formSection}>
                <h2>Método de Envio</h2>
                {shippingOptions.map(opt => (
                  <div key={opt.id} className={`${styles.shippingOption} ${selectedShipping?.id === opt.id ? styles.selected : ''}`} onClick={() => setSelectedShipping(opt)}><input type="radio" checked={selectedShipping?.id === opt.id} readOnly /><div className={styles.shippingDetails}><span>{opt.name}</span><small>{opt.delivery}</small></div><span className={styles.shippingPrice}>R$ {opt.price.toFixed(2).replace('.', ',')}</span></div>
                ))}
              </div>
            )}
            <div className={styles.formSection}>
              <h2>Pagamento</h2>
              <div className={styles.paymentTabs}>
                <button type="button" className={paymentMethod === 'card' ? styles.activeTab : ''} onClick={() => setPaymentMethod('card')}><FiCreditCard /> Cartão de Crédito</button>
                <button type="button" className={paymentMethod === 'pix' ? styles.activeTab : ''} onClick={() => setPaymentMethod('pix')}><FiSmartphone /> Pix</button>
              </div>
              {paymentMethod === 'card' && (<div id="cardPaymentBrick_container"></div>)}
              {paymentMethod === 'pix' && (
                <>
                  <div className={styles.paymentContent}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="pix_cpf">CPF do pagador</label>
                      <input type="text" id="pix_cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" required />
                    </div>
                    <div className={styles.pixContent}><p>Um QR Code para pagamento será gerado ao clicar no botão abaixo.</p></div>
                  </div>
                  <button type="button" onClick={handlePixSubmit} className={styles.submitButton} disabled={isProcessing || !selectedShipping}><FiLock /> {isProcessing ? 'Gerando Pix...' : `Gerar QR Code Pix (R$ ${total.toFixed(2).replace('.', ',')})`}</button>
                </>
              )}
            </div>
            {paymentError && <p className={styles.errorText}>{paymentError}</p>}
          </form>
        </div>
        <div className={styles.summaryColumn}>
          <div className={styles.summaryContent}>
            <h2>Resumo do Pedido</h2>
            <div className={styles.summaryItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.summaryItem}><div className={styles.itemImage}><Image src={item.image} alt={item.name} width={64} height={64} /><span className={styles.itemQuantity}>{item.quantity}</span></div><div className={styles.itemName}>{item.name}</div><div className={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</div></div>
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