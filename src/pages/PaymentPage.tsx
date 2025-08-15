import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { QRPaymentModal } from '../components/QRPaymentModal';
import { RatingModal } from '../components/RatingModal';
import { CreditCard, Building2, DollarSign, QrCode, Smartphone } from 'lucide-react';
import { apiClient } from '../lib/api';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'credit_card' | 'transfer' | 'cash' | 'qr' | 'mercadopago';
}

export function PaymentPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [processing, setProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const { paymentType, unpaidOrders } = location.state || {};
  const [ordersToShow, setOrdersToShow] = useState(unpaidOrders);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Efectivo',
      icon: <DollarSign className="w-5 h-5" />,
      type: 'cash'
    },
    {
      id: 'credit_card',
      name: 'Tarjeta de Crédito',
      icon: <CreditCard className="w-5 h-5" />,
      type: 'credit_card'
    },
    {
      id: 'qr',
      name: 'QR',
      icon: <QrCode className="w-5 h-5" />,
      type: 'qr'
    },
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      icon: <Smartphone className="w-5 h-5" />,
      type: 'mercadopago'
    }
  ];

  // Load orders based on payment type
  React.useEffect(() => {
    const loadOrders = async () => {
      if (paymentType === 'individual') {
        // Use client unpaid orders (already loaded)
        const clientOrders = await apiClient.getClientUnpaidOrders();
        setOrdersToShow(clientOrders);
      } else if (paymentType === 'table' && tableId) {
        // Use table unpaid orders
        const tableOrders = await apiClient.getUnpaidOrders(tableId);
        setOrdersToShow(tableOrders);
      }
    };

    if (paymentType) {
      loadOrders();
    }
  }, [paymentType, tableId]);

  const handlePayment = async () => {
    if (!tableId || !ordersToShow) return;
    
    setProcessing(true);
    
    try {
      // Create payment with API
      const paymentData = {
        method: selectedPaymentMethod,
        amount: ordersToShow.total_amount_owed.toString()
      };

      console.log('Creating payment:', paymentData);
      const response = await apiClient.createPayment(paymentData);
      console.log('Payment created:', response);
      
      setPaymentCompleted(true);
      
      // Show QR modal if QR payment was selected
      if (selectedPaymentMethod === 'qr') {
        setShowQRModal(true);
      } else {
        // Show rating modal for other payment methods
        setShowRatingModal(true);
      }
      
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleQRModalClose = () => {
    setShowQRModal(false);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = (rating: number, comment?: string) => {
    console.log('Rating submitted:', { rating, comment });
    
    // Navigate to confirmation
    navigate(`/confirmation/${tableId}`, {
      state: {
        orderNumber: 'PAID-' + Date.now(),
        total: ordersToShow?.total_amount_owed,
        paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name,
        rating,
        comment
      }
    });
  };

  const handleRatingClose = () => {
    // Navigate to confirmation without rating
    navigate(`/confirmation/${tableId}`, {
      state: {
        orderNumber: 'PAID-' + Date.now(),
        total: ordersToShow?.total_amount_owed,
        paymentMethod: paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name
      }
    });
  };

  if (!ordersToShow) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Pago" showBack />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Cargando información de pago...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      <Header title="Pago" showBack />

      <div className="p-4 space-y-6">
        {/* Payment Type Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Tipo de pago:
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            {paymentType === 'individual' ? 'Pagando solo mis órdenes' : 'Pagando toda la mesa'}
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {paymentType === 'individual' ? 'Pago Individual' : 'Pago de Mesa'}
          </h3>
          
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Mesa {ordersToShow.table_number} - Órdenes pendientes
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              Total a pagar: ${ordersToShow.total_amount_owed.toFixed(2)}
            </p>
          </div>
          
          {/* Order Details */}
          <div className="space-y-3 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Detalle de órdenes:</h4>
            {ordersToShow.orders.flatMap(order => 
              order.order_products.map((item, index) => (
                <div key={`${order.uuid || order.id}-${index}`} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.quantity}x {item.product_details?.name || item.offer_details?.name || 'Producto'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${((item.product_details?.price || item.offer_details?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Método de Pago
          </h3>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedPaymentMethod === method.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethod === method.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedPaymentMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-gray-700 dark:text-gray-300">
                    {method.icon}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {method.name}
                  </span>
                </div>
                
                {method.type === 'credit_card' && (
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      MC
                    </div>
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      V
                    </div>
                  </div>
                )}
                
                {method.type === 'qr' && (
                  <div className="w-8 h-5 bg-gray-800 rounded text-white text-xs flex items-center justify-center">
                    QR
                  </div>
                )}
                
                {method.type === 'mercadopago' && (
                  <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                    MP
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handlePayment}
          disabled={processing || paymentCompleted}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {processing || paymentCompleted ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {processing ? 'Procesando Pago...' : 'Pago Completado'}
            </div>
          ) : (
            `Pagar $${ordersToShow.total_amount_owed.toFixed(2)}`
          )}
        </button>
      </div>
      </div>

      {/* QR Payment Modal */}
      <QRPaymentModal
        isOpen={showQRModal}
        onClose={handleQRModalClose}
        amount={ordersToShow?.total_amount_owed || 0}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={handleRatingClose}
        onSubmit={handleRatingSubmit}
      />
    </>
  );
}