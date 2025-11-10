'use client';
import { FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext'; // Importa nosso hook
import styles from './CartPanel.module.css';

const CartPanel = () => {
  const { isPanelOpen, closeCartPanel, cartItems, cartItemCount } = useCart();

  if (!isPanelOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={closeCartPanel}></div>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Carrinho • {cartItemCount}</h3>
          <button onClick={closeCartPanel} className={styles.closeButton}><FiX size={24} /></button>
        </div>
        <div className={styles.content}>
          {cartItemCount === 0 ? (
            <p className={styles.emptyMessage}>Seu carrinho está vazio</p>
          ) : (
            <div>
              {/* AQUI VOCÊ FARIA O .map() DOS ITENS DO CARRINHO */}
              <p>Itens do carrinho aparecerão aqui...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPanel;