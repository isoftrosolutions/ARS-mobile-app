import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCart as fetchCartApi, addToCart as addToCartApi, removeCartItem, syncCart } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchCartApi();
      setItems(Array.isArray(data) ? data : []);
    } catch (_) {
      // ignore — keep prior state
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (bootstrapping) return;
    refresh();
  }, [bootstrapping, refresh]);

  const add = useCallback(async (productId, quantity = 1) => {
    const prev = [...items];
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.product_id === productId);
      if (existing) {
        return prevItems.map((i) =>
          i.product_id === productId ? { ...i, quantity: Number(i.quantity || 0) + quantity } : i,
        );
      }
      return [...prevItems, { id: `temp-${productId}`, product_id: productId, quantity, product_name: '…' }];
    });
    try {
      await addToCartApi({ productId, quantity });
      await refresh();
    } catch {
      setItems(prev);
    }
  }, [items, refresh]);

  const remove = useCallback(async (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
    try {
      await removeCartItem(cartItemId);
    } catch {
      await refresh();
    }
  }, [refresh]);

  const updateQuantity = useCallback(async (item, quantity) => {
    if (!item) return;
    if (quantity <= 0) {
      await remove(item.id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity } : i)));
    try {
      await addToCartApi({ productId: item.product_id, quantity });
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: item.quantity } : i)));
    }
  }, [remove]);

  const clear = useCallback(async () => {
    if (items.length === 0) return;
    try {
      await syncCart([]);
    } catch (_) {}
    setItems([]);
  }, [items.length]);

  const count = useMemo(() => items.reduce((sum, i) => sum + Number(i.quantity || 0), 0), [items]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const unit = Number(i.discount_price && Number(i.discount_price) > 0 ? i.discount_price : i.price) || 0;
        return sum + unit * Number(i.quantity || 0);
      }, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, loading, count, subtotal, refresh, add, remove, updateQuantity, clear }),
    [items, loading, count, subtotal, refresh, add, remove, updateQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
