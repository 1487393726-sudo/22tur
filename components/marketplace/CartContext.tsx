'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Equipment, EquipmentBundle } from '@/types/marketplace';

// 购物车项类型
export interface MarketplaceCartItem {
  id: string;
  productId: string;
  productType: 'EQUIPMENT' | 'BUNDLE';
  quantity: number;
  product: Equipment | EquipmentBundle;
}

// 购物车状态
interface CartState {
  items: MarketplaceCartItem[];
  isLoading: boolean;
}

// 购物车操作类型
type CartAction =
  | { type: 'SET_ITEMS'; payload: MarketplaceCartItem[] }
  | { type: 'ADD_ITEM'; payload: MarketplaceCartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean };

// 购物车上下文类型
interface CartContextType {
  items: MarketplaceCartItem[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  addItem: (product: Equipment | EquipmentBundle, productType: 'EQUIPMENT' | 'BUNDLE', quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const CART_STORAGE_KEY = 'marketplace_cart';

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId && item.productType === action.payload.productType
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isLoading: true });

  // 从 localStorage 加载购物车
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as MarketplaceCartItem[];
        dispatch({ type: 'SET_ITEMS', payload: items });
      }
    } catch (error) {
      console.error('加载购物车失败:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
      } catch (error) {
        console.error('保存购物车失败:', error);
      }
    }
  }, [state.items, state.isLoading]);

  // 添加商品
  const addItem = useCallback(
    (product: Equipment | EquipmentBundle, productType: 'EQUIPMENT' | 'BUNDLE', quantity = 1) => {
      const newItem: MarketplaceCartItem = {
        id: `${productType}-${product.id}`,
        productId: product.id,
        productType,
        quantity,
        product,
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    },
    []
  );

  // 移除商品
  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  // 更新数量
  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  // 清空购物车
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // 获取商品数量
  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = state.items.find((i) => i.productId === productId);
      return item?.quantity || 0;
    },
    [state.items]
  );

  // 计算总数量
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // 计算小计
  const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // 计算总价（暂时等于小计，后续可添加运费等）
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isLoading: state.isLoading,
        itemCount,
        subtotal,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// 工具函数：计算购物车总价
export function calculateCartTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
