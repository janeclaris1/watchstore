import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  watchId: string;
  slug: string;
  brand: string;
  model: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  currency: "GBP" | "USD" | "EUR";
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (watchId: string) => void;
  updateQuantity: (watchId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setCurrency: (currency: "GBP" | "USD" | "EUR") => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currency: "USD",

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.watchId === item.watchId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.watchId === item.watchId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }], isOpen: true });
        }
      },

      removeItem: (watchId) => {
        set({ items: get().items.filter((i) => i.watchId !== watchId) });
      },

      updateQuantity: (watchId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(watchId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.watchId === watchId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCurrency: (currency) => set({ currency }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "watchstore-cart" }
  )
);

interface WishlistStore {
  items: string[];
  addItem: (watchId: string) => void;
  removeItem: (watchId: string) => void;
  toggleItem: (watchId: string) => void;
  hasItem: (watchId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (watchId) => {
        if (!get().items.includes(watchId)) {
          set({ items: [...get().items, watchId] });
        }
      },
      removeItem: (watchId) => {
        set({ items: get().items.filter((id) => id !== watchId) });
      },
      toggleItem: (watchId) => {
        if (get().items.includes(watchId)) {
          get().removeItem(watchId);
        } else {
          get().addItem(watchId);
        }
      },
      hasItem: (watchId) => get().items.includes(watchId),
    }),
    { name: "watchstore-wishlist" }
  )
);
