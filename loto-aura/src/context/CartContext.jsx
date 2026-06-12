// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Inicializamos el carrito buscando si hay datos previos guardados en el navegador
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('lotoAuraCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Cada vez que el carrito cambia, lo guardamos en localStorage para que no se borre al recargar
  useEffect(() => {
    localStorage.setItem('lotoAuraCart', JSON.stringify(cart));
  }, [cart]);

  // Función para agregar al carrito sumando cantidades si ya existe
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  // Función para eliminar un producto del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Función para actualizar la cantidad
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Vaciar carrito
  const clearCart = () => setCart([]);

  // Calcular el total en Bolivianos (Bs.)
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Cantidad total de items (para el icono del Navbar)
  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};