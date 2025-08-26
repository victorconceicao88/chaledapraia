"use client";
import { createContext, useState, useMemo } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  
const addToCart = (itemId, quantity, name, price, options = {}) => {
  setCart((prev) => {
    // Verificar se o item já está no carrinho com as MESMAS opções
    const existingItemIndex = prev.findIndex((item) => 
      item.id === itemId && 
      JSON.stringify(item.options) === JSON.stringify(options)
    );
    
    if (existingItemIndex !== -1) {
      // Atualizar quantidade se o item já existe com as MESMAS opções
      const updatedCart = [...prev];
      updatedCart[existingItemIndex].quantity += quantity;
      return updatedCart;
    }
    
    // Adicionar novo item ao carrinho com opções
    return [...prev, { id: itemId, quantity, name, price, options }];
  });
};

  const updateQuantity = (itemId, newQuantity, options = {}) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, options);
      return;
    }
    
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId && JSON.stringify(item.options) === JSON.stringify(options)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId, options = {}) => {
    setCart((prev) => 
      prev.filter((item) => 
        !(item.id === itemId && JSON.stringify(item.options) === JSON.stringify(options))
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 0;
      return sum + itemPrice * itemQuantity;
    }, 0);
  };

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    setCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    calculateTotal,
    totalItems
  }), [cart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};