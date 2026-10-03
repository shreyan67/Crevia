import { create } from 'zustand';

export interface CartItem {
  id: string; // unique ID for cart item
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  flavor?: string;
  size?: string;
  message?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setIsOpen: (isOpen: boolean) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (item) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => {
      // Check if exact same item exists (same product, flavor, size, message)
      const existingItemIndex = state.items.findIndex(
        (i) => i.productId === item.productId && 
               i.flavor === item.flavor && 
               i.size === item.size && 
               i.message === item.message
      );

      if (existingItemIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += item.quantity;
        return { items: newItems, isOpen: true };
      }

      return { items: [...state.items, { ...item, id }], isOpen: true };
    });
  },
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((i) => i.id === id ? { ...i, quantity } : i)
  })),
  setIsOpen: (isOpen) => set({ isOpen }),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  totalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
}));
