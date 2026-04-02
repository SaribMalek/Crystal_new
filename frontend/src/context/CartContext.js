import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!user) {
      openAuthModal('login', 'Please login or create an account to add crystals to your cart.');
      return { added: false, requiresAuth: true };
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      const price = product.sale_price || product.price;
      return [...prev, { ...product, quantity, price }];
    });
    setIsCartOpen(true);
    return { added: true };
  };

  const removeFromCart = (id) => setCartItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);
    setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isCartOpen, setIsCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
