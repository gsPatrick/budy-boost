'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // NOVO: Estado de inicialização

  // Efeito para carregar o carrinho do localStorage APENAS no cliente
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('buddyboost_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Falha ao carregar o carrinho do localStorage", error);
    }
    // Marca o contexto como inicializado após a primeira tentativa de carregamento
    setIsInitialized(true);
  }, []);

  // Efeito para salvar o carrinho no localStorage sempre que ele mudar,
  // mas SÓ depois que o estado inicial já foi carregado.
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('buddyboost_cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error("Falha ao salvar o carrinho no localStorage", error);
      }
    }
  }, [cartItems, isInitialized]);

  const openCartPanel = () => setIsPanelOpen(true);
  const closeCartPanel = () => setIsPanelOpen(false);

  const addToCart = (productToAdd) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === productToAdd.id
            ? { ...item, quantity: (item.quantity || 0) + 1 } // Adicionado fallback para quantity
            : item
        );
      } else {
        return [...prevItems, { ...productToAdd, quantity: 1 }];
      }
    });
    openCartPanel();
  };

  // Funções para o CartPanel usar
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 0)), 0);

  // O valor do contexto agora inclui todas as funções e estados necessários
  const value = {
    cartItems,
    cartItemCount,
    subtotal,
    isPanelOpen,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    openCartPanel,
    closeCartPanel,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};