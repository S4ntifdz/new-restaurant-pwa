import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartOffer, Product, Offer } from '../types';

interface CartStore {
  items: CartItem[];
  offers: CartOffer[];
  notes: string;
  addItem: (product: Product, quantity?: number) => void;
  addOffer: (offer: Offer, quantity?: number) => void;
  removeItem: (productId: string) => void;
  removeOffer: (offerId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateOfferQuantity: (offerId: string, quantity: number) => void;
  clearCart: () => void;
  setNotes: (notes: string) => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getService: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      offers: [],
      notes: '',

      addItem: (product: Product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.product.uuid === product.uuid);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.product.uuid === product.uuid
                ? { ...item, quantity: item.quantity + quantity, type: 'product' }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { product, quantity, type: 'product' }],
          });
        }
      },

      addOffer: (offer: Offer, quantity = 1) => {
        const offers = get().offers;
        const existingOffer = offers.find(item => item.offer.uuid === offer.uuid);

        if (existingOffer) {
          set({
            offers: offers.map(item =>
              item.offer.uuid === offer.uuid
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            offers: [...offers, { offer, quantity, type: 'offer' }],
          });
        }
      },
      removeItem: (productUuid: string) => {
        set({
          items: get().items.filter(item => item.product.uuid !== productUuid),
        });
      },

      removeOffer: (offerUuid: string) => {
        set({
          offers: get().offers.filter(item => item.offer.uuid !== offerUuid),
        });
      },
      updateQuantity: (productUuid: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productUuid);
          return;
        }

        set({
          items: get().items.map(item =>
            item.product.uuid === productUuid
              ? { ...item, quantity }
              : item
          ),
        });
      },

      updateOfferQuantity: (offerUuid: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeOffer(offerUuid);
          return;
        }

        set({
          offers: get().offers.map(item =>
            item.offer.uuid === offerUuid
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => {
        set({ items: [], offers: [], notes: '' });
      },

      setNotes: (notes: string) => {
        set({ notes });
      },

      getSubtotal: () => {
        const itemsTotal = get().items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const offersTotal = get().offers.reduce((sum, item) => sum + (item.offer.price * item.quantity), 0);
        return itemsTotal + offersTotal;
      },

      getService: () => {
        return get().getSubtotal() * 0.1; // 10% service charge
      },

      getTotal: () => {
        return get().getSubtotal() + get().getService();
      },

      getItemCount: () => {
        const itemsCount = get().items.reduce((sum, item) => sum + item.quantity, 0);
        const offersCount = get().offers.reduce((sum, item) => sum + item.quantity, 0);
        return itemsCount + offersCount;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);