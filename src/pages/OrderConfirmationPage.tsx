import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '../stores/useAuthStore';
import { apiClient } from '../lib/api';
import { X } from 'lucide-react';

export function OrderConfirmationPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { items, offers, notes, getTotal, clearCart } = useCartStore();
  const { tableId: authTableId } = useAuthStore();
  const [processing, setProcessing] = useState(false);

  const total = getTotal();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0) + 
                     offers.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmOrder = async () => {
    if (!tableId || (items.length === 0 && offers.length === 0)) return;
    
    setProcessing(true);
    
    try {
      // Create order with API
      const orderData = {
        table: tableId,
        order_products: items.map(item => ({
          product: item.product.uuid,
          quantity: item.quantity
        })),
        order_offers: offers.map(item => ({
          offer: item.offer.uuid,
          quantity: item.quantity
        })),
        notes: notes || undefined
      };

      console.log('Creating order:', orderData);
      const response = await apiClient.createOrder(orderData);
      console.log('Order created:', response);
      
      // Clear cart after successful order
      clearCart();
      
      // Navigate back to dashboard with success message
      navigate(`/dashboard/${tableId}`, {
        replace: true,
        state: {
          orderCreated: true,
          orderNumber: response.order_number
        }
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear la orden. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate(`/cart/${tableId}`);
  };

  if (items.length === 0 && offers.length === 0) {
    navigate(`/menu/${tableId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Confirmar Pedido" showBack />

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Confirmar Pedido
            </h2>
            <button
              onClick={handleCancel}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <p className="text-gray-900 dark:text-white mb-4">
              Estás encargando:
            </p>
            <p className="text-2xl font-bold text-orange-500 mb-4">
              {totalItems} producto{totalItems !== 1 ? 's' : ''}
            </p>

            {/* Items List */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product.uuid} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {offers.map((item) => (
                <div key={item.offer.uuid} className="flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  <span className="text-orange-700 dark:text-orange-300">
                    {item.quantity}x {item.offer.name} 🎉
                  </span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    ${(item.offer.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Notas:
                </p>
                <p className="text-gray-900 dark:text-white">
                  {notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={processing}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </div>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}