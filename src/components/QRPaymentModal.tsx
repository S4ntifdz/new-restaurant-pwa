import React from 'react';
import { X, QrCode } from 'lucide-react';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

export function QRPaymentModal({ isOpen, onClose, amount }: QRPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pago con QR
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            {/* Placeholder for QR code - in real implementation, this would be the actual QR image */}
            <div className="text-center">
              <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                QR de Pago
              </p>
            </div>
          </div>
          
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            ${amount.toFixed(2)}
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Escanea este código con tu app de pagos
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Instrucciones:
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>1. Abre tu app de pagos favorita</li>
            <li>2. Escanea el código QR</li>
            <li>3. Confirma el pago de ${amount.toFixed(2)}</li>
            <li>4. Espera la confirmación</li>
          </ol>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 rounded-lg font-medium transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}