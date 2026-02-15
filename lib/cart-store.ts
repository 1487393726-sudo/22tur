"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceNameEn: string;
  categorySlug: string;
  quantity: number;
  unitPrice: number;
  options?: Record<string, any>;
  note?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateOptions: (id: string, options: Record<string, any>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `${item.serviceId}-${Date.now()}`;
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      updateOptions: (id, options) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, options } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          let itemTotal = item.unitPrice * item.quantity;
          // 加上选项价格
          if (item.options) {
            Object.values(item.options).forEach((opt: any) => {
              if (opt && typeof opt === "object" && opt.priceImpact) {
                itemTotal += opt.priceImpact * item.quantity;
              }
            });
          }
          return total + itemTotal;
        }, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "service-cart",
    }
  )
);
