import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { QuantityControl } from '../components/QuantityControl';
import { useCartStore } from '../stores/useCartStore';
import { Trash2 } from 'lucide-react';

export function CartPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { 
    items, 
    offers,
    notes, 
    setNotes, 
    updateQuantity, 
    updateOfferQuantity,
    removeItem, 
    removeOffer,
    getSubtotal, 
    getService, 
    getTotal 
  } = useCartStore();

  const subtotal = getSubtotal();
  const service = getService();
  const total = getTotal();

  const handleProceedToOrder = () => {
    if (items.length === 0 && offers.length === 0) return;
    navigate(`/order-confirmation/${tableId}`);
  };

  if (items.length === 0 && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Carrito" showBack />
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Agrega algunos productos del menú para continuar
            </p>
            <button
              onClick={() => navigate(`/menu/${tableId}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Ver Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      <Header title="Carrito" showBack />

      <div className="p-4 space-y-6">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.product.uuid}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <img
                  src="/src/media/rapimozo_test_image.png"
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    ${item.product.price.toFixed(2)} c/u
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <QuantityControl
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(item.product.uuid, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.product.uuid, item.quantity - 1)}
                    />
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.uuid)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Cart Offers */}
          {offers.map((item) => (
            <div
              key={item.offer.uuid}
              className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 shadow-sm border-2 border-orange-200 dark:border-orange-700"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-orange-200 dark:bg-orange-800/30 flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    {item.offer.name}
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                    ${item.offer.price.toFixed(2)} c/u • Oferta especial
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <QuantityControl
                      quantity={item.quantity}
                      onIncrease={() => updateOfferQuantity(item.offer.uuid, item.quantity + 1)}
                      onDecrease={() => updateOfferQuantity(item.offer.uuid, item.quantity - 1)}
                    />
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-orange-900 dark:text-orange-100">
                        ${(item.offer.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeOffer(item.offer.uuid)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Notas para la cocina
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones especiales, alergias, etc."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Resumen del Pedido
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Servicio (10%)</span>
              <span className="text-gray-900 dark:text-white">${service.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handleProceedToOrder}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Encargar Pedido • ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}