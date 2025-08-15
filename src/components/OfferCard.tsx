import React from 'react';
import { Offer } from '../types';
import { QuantityControl } from './QuantityControl';
import { useCartStore } from '../stores/useCartStore';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const { addOffer, offers, updateOfferQuantity } = useCartStore();
  
  const cartOffer = offers.find(item => item.offer.uuid === offer.uuid);
  const quantity = cartOffer?.quantity || 0;

  const handleAddToCart = () => {
    addOffer(offer, 1);
  };

  const handleIncrease = () => {
    updateOfferQuantity(offer.uuid, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      updateOfferQuantity(offer.uuid, quantity - 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg shadow-sm border-2 border-orange-300 dark:border-orange-700 overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-orange-200 dark:bg-orange-800/30 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
            OFERTA ESPECIAL
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-orange-900 dark:text-orange-100">
            {offer.name}
          </h3>
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            ${offer.price.toFixed(2)}
          </span>
        </div>
        
        <div className="text-sm text-orange-700 dark:text-orange-300 mb-3">
          <p className="font-medium mb-1">Incluye:</p>
          {offer.products.map((item, index) => (
            <p key={index} className="text-xs">
              • {item.quantity}x {item.product.name}
            </p>
          ))}
        </div>

        <div className="flex items-center justify-between">
          {quantity > 0 ? (
            <QuantityControl
              quantity={quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">-</span>
              <span className="w-8 text-center">0</span>
              <span className="text-xs text-gray-500">+</span>
            </div>
          )}
          
          <button
            onClick={handleAddToCart}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Agregar Oferta
          </button>
        </div>
      </div>
    </div>
  );
}