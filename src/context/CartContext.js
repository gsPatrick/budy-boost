'use client';

import { createContext, useState, useContext } from 'react';

// 1. Cria o Contexto
const CartContext = createContext();

// 2. Cria o Provedor (Provider)
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const openCartPanel = () => setIsPanelOpen(true);
  const closeCartPanel = () => setIsPanelOpen(false);

  const addToCart = (product, quantity) => {
    // Lógica para adicionar ao carrinho (pode ser mais complexa)
    console.log(`Adicionando ${quantity}x ${product.name} ao carrinho.`);
    
    // Simplesmente abre o painel por enquanto
    openCartPanel();
  };

  const cartItemCount = cartItems.length; // Simples contagem por enquanto

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      isPanelOpen,
      openCartPanel,
      closeCartPanel,
      cartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Cria um hook customizado para facilitar o uso
export const useCart = () => {
  return useContext(CartContext);
};