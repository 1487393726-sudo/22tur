'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { Equipment } from '@/types/marketplace';

const MAX_COMPARE_ITEMS = 4;
const COMPARE_STORAGE_KEY = 'marketplace_compare';

// 比较状态
interface CompareState {
  items: Equipment[];
  isLoading: boolean;
}

// 比较操作类型
type CompareAction =
  | { type: 'SET_ITEMS'; payload: Equipment[] }
  | { type: 'ADD_ITEM'; payload: Equipment }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_LOADING'; payload: boolean };

// 比较上下文类型
interface CompareContextType {
  items: Equipment[];
  isLoading: boolean;
  itemCount: number;
  canAdd: boolean;
  addItem: (product: Equipment) => boolean;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
}

// Reducer
function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      if (state.items.length >= MAX_COMPARE_ITEMS) {
        return state;
      }
      if (state.items.some((item) => item.id === action.payload.id)) {
        return state;
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'CLEAR_ALL':
      return { ...state, items: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, { items: [], isLoading: true });

  // 从 localStorage 加载比较列表
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as Equipment[];
        dispatch({ type: 'SET_ITEMS', payload: items.slice(0, MAX_COMPARE_ITEMS) });
      }
    } catch (error) {
      console.error('加载比较列表失败:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(state.items));
      } catch (error) {
        console.error('保存比较列表失败:', error);
      }
    }
  }, [state.items, state.isLoading]);

  // 添加产品到比较
  const addItem = useCallback(
    (product: Equipment): boolean => {
      if (state.items.length >= MAX_COMPARE_ITEMS) {
        return false;
      }
      if (state.items.some((item) => item.id === product.id)) {
        return false;
      }
      dispatch({ type: 'ADD_ITEM', payload: product });
      return true;
    },
    [state.items]
  );

  // 从比较中移除
  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  // 清空比较列表
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // 检查是否在比较列表中
  const isInCompare = useCallback(
    (id: string) => state.items.some((item) => item.id === id),
    [state.items]
  );

  return (
    <CompareContext.Provider
      value={{
        items: state.items,
        isLoading: state.isLoading,
        itemCount: state.items.length,
        canAdd: state.items.length < MAX_COMPARE_ITEMS,
        addItem,
        removeItem,
        clearAll,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

export { MAX_COMPARE_ITEMS };
