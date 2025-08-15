import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useThemeStore } from '../stores/useThemeStore';

export function ConfirmationPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();

  const { orderNumber, orderId, total, paymentMethod } = location.state || {};

  const handleBackToHome = () => {
    navigate(`/dashboard/${tableId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg text-center max-w-md w-full">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Orden Confirmada!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tu orden ha sido enviada a la cocina
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Número de Orden:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                #{orderNumber || '1234'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${total?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            {orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID de Orden:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {orderId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado:</p>
          <p className="text-orange-600 dark:text-orange-400 font-medium">
            Recibida
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Tiempo estimado: 15-20 minutos
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBackToHome}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors mb-4"
        >
          Volver al Inicio
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>
    </div>
  );
}