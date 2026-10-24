"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { Product } from "@/lib/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  mounted: boolean;
  couponCode: string | null;
  discount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "homecare-cart";
const COUPON_STORAGE_KEY = "homecare-coupon";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const stored = loadCart();
      if (stored.length > 0) {
        setCartItems(stored);
      }
      try {
        const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
        if (savedCoupon) {
          setCouponCode(savedCoupon);
        }
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Persist cart to localStorage on every change
  useEffect(() => {
    if (mounted) {
      saveCart(cartItems);
    }
  }, [cartItems, mounted]);

  // Persist coupon to localStorage
  useEffect(() => {
    if (mounted) {
      if (couponCode) {
        try {
          localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
        } catch {}
      } else {
        try {
          localStorage.removeItem(COUPON_STORAGE_KEY);
        } catch {}
      }
    }
  }, [couponCode, mounted]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Dynamic discount calculation
  const discount = useMemo(() => {
    if (!couponCode) return 0;
    const clean = couponCode.toUpperCase().trim();
    if (clean === "WELCOME2500" || clean === "WELCOME2K") {
      return cartTotal >= 25000 ? 2500 : 0;
    }
    if (clean === "CAREPAY10") {
      return cartTotal >= 50000 ? Math.min(10000, Math.round(cartTotal * 0.1)) : 0;
    }
    return 0;
  }, [couponCode, cartTotal]);

  const applyCoupon = useCallback((code: string) => {
    const clean = code.toUpperCase().trim();
    if (clean === "WELCOME2500" || clean === "WELCOME2K") {
      setCouponCode(clean);
      return { success: true, message: "₦2,500 welcome voucher applied! (Min order ₦25,000)" };
    }
    if (clean === "CAREPAY10") {
      setCouponCode(clean);
      return { success: true, message: "10% discount applied! (Min order ₦50,000)" };
    }
    return { success: false, message: "Invalid voucher code. Please check and try again." };
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
  }, []);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    mounted,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
  }), [
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    mounted,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
