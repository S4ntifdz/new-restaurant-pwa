import React from 'react';
import { Product } from '../types';
import { QuantityControl } from './QuantityControl';
import { useCartStore } from '../stores/useCartStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  
  const cartItem = items.find(item => item.product.uuid === product.uuid);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  const handleIncrease = () => {
    updateQuantity(product.uuid, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      updateQuantity(product.uuid, quantity - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src="/src/media/rapimozo_test_image.png"
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-orange-500">
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          {quantity > 0 ? (
            <QuantityControl
              quantity={quantity}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              max={product.stock}
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
            disabled={product.stock <= 0}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}