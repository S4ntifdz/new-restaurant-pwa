import React, { useState, useEffect } from 'react';
import { Offer } from '../types';

interface OffersCarouselProps {
  offers: Offer[];
}

export function OffersCarousel({ offers }: OffersCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (offers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === offers.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [offers.length]);

  if (offers.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        🎉 Ofertas Especiales
      </h3>
      
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {offers.map((offer) => (
            <div
              key={offer.uuid}
              className="w-full flex-shrink-0 bg-gradient-to-r from-orange-400 to-orange-500 p-6 text-white"
            >
              <div className="text-center">
                <h4 className="text-xl font-bold mb-2">{offer.name}</h4>
                <p className="text-2xl font-bold mb-2">${offer.price.toFixed(2)}</p>
                <p className="text-sm opacity-90">
                  {offer.products.length} productos incluidos
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-3 space-x-2">
        {offers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-orange-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}