'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import styles from './CartPanel.module.css';

const CartPanel = () => {
  // Pega todas as funções e estados necessários do contexto
  const { 
    isPanelOpen, 
    closeCartPanel, 
    cartItems, 
    removeFromCart, 
    updateCartQuantity, 
    subtotal 
  } = useCart();

  if (!isPanelOpen) {
    return null;
  }

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
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImage}>
                    <Image src={item.image} alt={item.name} width={80} height={80} />
                  </div>
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.name}</p>
                    <div className={styles.itemActions}>
                      <div className={styles.quantitySelector}>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <p className={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}><FiTrash2 /></button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <p className={styles.shippingInfo}>Frete e impostos calculados no checkout.</p>
              <button className={styles.checkoutButton}>Finalizar Compra</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPanel;