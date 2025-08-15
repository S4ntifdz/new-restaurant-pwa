import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  min = 0,
  max = 999,
  size = 'md'
}: QuantityControlProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm'
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors`}
      >
        <Minus className={iconSize} />
      </button>
      
      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
        {quantity}
      </span>
      
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}