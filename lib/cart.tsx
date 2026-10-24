"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { Product } from "@/lib/products";

export interface CartItem {
  product: Product;
  quantity: number;
  withInstallation?: boolean;
  installationFee?: number;
  packVariantId?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    withInstallation?: boolean,
    installationFee?: number,
    packVariantId?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleInstallation: (productId: string, enabled?: boolean, fee?: number) => void;
  setInstallationForProduct: (productId: string, enabled: boolean, fee?: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemsSubtotal: number;
  installationTotal: number;
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
    if (!stored) return [];
    const parsed: CartItem[] = JSON.parse(stored);
    return parsed.map((item) => {
      // Clean up any legacy items where ID ended with -installed
      if (item.product?.id?.includes("-installed")) {
        const cleanId = item.product.id.replace("-installed", "");
        const cleanName = item.product.name.replace(/\s*\+\s*HomeCare™?\s*Certified\s*Installation/gi, "");
        const installFee = item.installationFee || 7500;
        const basePrice = Math.max(1000, item.product.price - installFee);
        return {
          ...item,
          product: {
            ...item.product,
            id: cleanId,
            name: cleanName,
            price: basePrice,
          },
          withInstallation: true,
          installationFee: installFee,
        };
      }
      return {
        ...item,
        withInstallation: item.withInstallation ?? false,
        installationFee: item.installationFee ?? 7500,
      };
    });
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

  const addToCart = useCallback(
    (
      product: Product,
      quantity: number = 1,
      withInstallation?: boolean,
      installationFee: number = 7500,
      packVariantId?: string
    ) => {
      setCartItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          return prev.map((item, idx) => {
            if (idx === existingIndex) {
              return {
                ...item,
                quantity: item.quantity + quantity,
                withInstallation:
                  withInstallation !== undefined
                    ? withInstallation
                    : item.withInstallation ?? false,
                installationFee: installationFee || item.installationFee || 7500,
                packVariantId: packVariantId || item.packVariantId,
              };
            }
            return item;
          });
        }
        return [
          ...prev,
          {
            product,
            quantity,
            withInstallation: withInstallation ?? false,
            installationFee: installationFee || 7500,
            packVariantId,
          },
        ];
      });
    },
    []
  );

  const toggleInstallation = useCallback(
    (productId: string, enabled?: boolean, fee: number = 7500) => {
      setCartItems((prev) =>
        prev.map((item) => {
          if (item.product.id === productId) {
            const nextVal = enabled !== undefined ? enabled : !item.withInstallation;
            return {
              ...item,
              withInstallation: nextVal,
              installationFee: fee || item.installationFee || 7500,
            };
          }
          return item;
        })
      );
    },
    []
  );

  const setInstallationForProduct = useCallback(
    (productId: string, enabled: boolean, fee: number = 7500) => {
      toggleInstallation(productId, enabled, fee);
    },
    [toggleInstallation]
  );

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

  // Separate item base prices from certified installation fees for full transparency
  const itemsSubtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const installationTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) =>
        sum + (item.withInstallation ? (item.installationFee ?? 7500) * item.quantity : 0),
      0
    );
  }, [cartItems]);

  const cartTotal = itemsSubtotal + installationTotal;

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Dynamic discount calculation
  const discount = useMemo(() => {
    if (!couponCode) return 0;
    const clean = couponCode.toUpperCase().trim();

    // Welcome vouchers: WELCOME2500, WELCOME2K, WELCOME, FIRSTORDER
    if (["WELCOME2500", "WELCOME2K", "WELCOME", "FIRSTORDER"].includes(clean)) {
      if (cartTotal <= 0) return 0;
      if (cartTotal >= 15000) {
        return Math.min(2500, cartTotal);
      }
      // For orders under ₦15,000, provide an immediate 15% discount
      return Math.min(2500, Math.round(cartTotal * 0.15));
    }

    // CarePay % vouchers: CAREPAY10, SAVE10, DISCOUNT10, CAREPAY
    if (["CAREPAY10", "SAVE10", "DISCOUNT10", "CAREPAY"].includes(clean)) {
      if (cartTotal <= 0) return 0;
      return Math.min(15000, Math.round(cartTotal * 0.1));
    }

    // HomeCare VIP vouchers: HOMECARE, HC2026, CAREPAY2026
    if (["HOMECARE", "HC2026", "CAREPAY2026"].includes(clean)) {
      if (cartTotal <= 0) return 0;
      if (cartTotal >= 20000) {
        return Math.min(3000, cartTotal);
      }
      return Math.min(3000, Math.round(cartTotal * 0.1));
    }

    // Free installation voucher: FREEINSTALL, INSTALLFREE
    if (["FREEINSTALL", "INSTALLFREE"].includes(clean)) {
      if (installationTotal > 0) {
        return Math.min(installationTotal, 7500);
      }
      if (cartTotal >= 35000) {
        return 7500;
      }
      return 0;
    }

    return 0;
  }, [couponCode, cartTotal, installationTotal]);

  const applyCoupon = useCallback((code: string) => {
    const clean = code.toUpperCase().trim();
    if (["WELCOME2500", "WELCOME2K", "WELCOME", "FIRSTORDER"].includes(clean)) {
      setCouponCode(clean);
      return {
        success: true,
        message: "₦2,500 Welcome Voucher applied! Enjoy immediate savings on your order.",
      };
    }
    if (["CAREPAY10", "SAVE10", "DISCOUNT10", "CAREPAY"].includes(clean)) {
      setCouponCode(clean);
      return {
        success: true,
        message: "10% Discount applied! Your total has been reduced.",
      };
    }
    if (["HOMECARE", "HC2026", "CAREPAY2026"].includes(clean)) {
      setCouponCode(clean);
      return {
        success: true,
        message: "₦3,000 HomeCare VIP Voucher applied!",
      };
    }
    if (["FREEINSTALL", "INSTALLFREE"].includes(clean)) {
      setCouponCode(clean);
      return {
        success: true,
        message: "Free Installation Voucher applied! ₦7,500 installation fee waived.",
      };
    }
    return {
      success: false,
      message: `"${code.trim()}" is not valid. Try WELCOME2500 or SAVE10 for instant savings.`,
    };
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
  }, []);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleInstallation,
    setInstallationForProduct,
    clearCart,
    cartTotal,
    itemsSubtotal,
    installationTotal,
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
    toggleInstallation,
    setInstallationForProduct,
    clearCart,
    cartTotal,
    itemsSubtotal,
    installationTotal,
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
