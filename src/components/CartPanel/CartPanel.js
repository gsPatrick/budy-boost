'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiX, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import styles from './CartPanel.module.css';

const CartPanel = () => {
  const router = useRouter();
  
  const { 
    isPanelOpen, 
    closeCartPanel, 
    cartItems, 
    removeFromCart, 
    updateCartQuantity, 
    // Nota: Calculamos o subtotal localmente para garantir precisão com os preços de assinatura
  } = useCart();

  // 1. Lógica para detectar tipos de itens no carrinho
  const subscriptionItem = cartItems.find(item => item.purchaseType === 'subscribe');
  const hasNormalItems = cartItems.some(item => item.purchaseType !== 'subscribe');

  // 2. Lógica de Checkout
  const handleCheckout = () => {
    closeCartPanel(); 

    if (subscriptionItem) {
        // REGRA DE SEGURANÇA:
        // Se tiver itens normais misturados com assinatura, bloqueamos (ou avisamos).
        // A API de recorrência é isolada.
        if (hasNormalItems) {
            alert("Atenção: Assinaturas devem ser compradas separadamente dos produtos normais. Por favor, remova os outros itens para prosseguir.");
            return; 
        }

        // Monta a URL para o Checkout de Assinatura
        const params = new URLSearchParams({
            produtoId: subscriptionItem.id,
            quantidade: subscriptionItem.quantity,
            frequencia: subscriptionItem.frequency
        });
        
        router.push(`/assinatura/checkout?${params.toString()}`);

    } else {
        // Fluxo de Compra Normal (Checkout Padrão)
        router.push('/checkout'); 
    }
  };

  if (!isPanelOpen) {
    return null;
  }

  // Recalcula subtotal
  const calculatedSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className={styles.overlay} onClick={closeCartPanel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Seu Carrinho</h3>
          <button onClick={closeCartPanel} className={styles.closeButton}><FiX /></button>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Seu carrinho está vazio.</p>
            <Link href="/loja" onClick={closeCartPanel} className={styles.shopLink}>
              Continuar comprando
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {cartItems.map(item => (
                <div 
                    key={item.id} 
                    className={`${styles.item} ${item.purchaseType === 'subscribe' ? styles.subscriptionItem : ''}`}
                >
                  <div className={styles.itemImage}>
                    <Image 
                        src={item.image} 
                        alt={item.name} 
                        width={80} 
                        height={80} 
                        style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>
                        {item.name}
                        {/* Badge visual para Assinatura */}
                        {item.purchaseType === 'subscribe' && (
                            <span className={styles.badgeSub}>
                                <FiRefreshCw size={10} /> a cada {item.frequency} dias
                            </span>
                        )}
                    </p>
                    <div className={styles.itemActions}>
                      <div className={styles.quantitySelector}>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <p className={styles.itemPrice}>
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            {/* Aviso caso tenha mistura de itens */}
            {subscriptionItem && hasNormalItems && (
                <div className={styles.warningBox}>
                    ⚠️ Atenção: Assinaturas devem ser finalizadas separadamente. Remova os produtos de compra única para prosseguir com a assinatura.
                </div>
            )}

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span>R$ {calculatedSubtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <p className={styles.shippingInfo}>Frete e impostos calculados no checkout.</p>
              
              <button 
                onClick={handleCheckout} 
                className={styles.checkoutButton}
                // Desabilita se houver mistura de tipos de compra
                disabled={subscriptionItem && hasNormalItems}
                style={(subscriptionItem && hasNormalItems) ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
              >
                {subscriptionItem ? 'Finalizar Assinatura' : 'Finalizar Compra'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPanel;