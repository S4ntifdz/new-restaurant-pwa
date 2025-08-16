import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { QRPaymentModal } from '../components/QRPaymentModal';
import { RatingModal } from '../components/RatingModal';
import { CreditCard, Building2, DollarSign, QrCode, Smartphone, Heart, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showTipSection, setShowTipSection] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTipAmount, setCustomTipAmount] = useState('');
  
  const { paymentType, unpaidOrders } = location.state || {};
  const [ordersToShow, setOrdersToShow] = useState(unpaidOrders);

  // Mock data for waiters - in real app this would come from API
  const waiters = [
    { id: '1', name: 'Carlos', percentage: 10 },
    { id: '2', name: 'María', percentage: 15 },
    { id: '3', name: 'José', percentage: 12 },
    { id: '4', name: 'Ana', percentage: 18 },
    { id: '5', name: 'Luis', percentage: 20 },
  ];

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
        // Show rating modal after 3 seconds for other payment methods
        setTimeout(() => {
          setShowRatingModal(true);
        }, 3000);
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
    // Show rating modal after 3 seconds when QR modal closes
    setTimeout(() => {
      setShowRatingModal(true);
    }, 3000);
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

  const calculateTipAmount = () => {
    if (!ordersToShow) return 0;
    
    if (selectedWaiter === 'custom') {
      return parseFloat(customTipAmount) || 0;
    }
    
    const waiter = waiters.find(w => w.id === selectedWaiter);
    if (waiter) {
      return (ordersToShow.total_amount_owed * waiter.percentage) / 100;
    }
    
    return 0;
  };

  const getTotalWithTip = () => {
    if (!ordersToShow) return 0;
    return ordersToShow.total_amount_owed + calculateTipAmount();
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

        {/* Tip Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowTipSection(!showTipSection)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Dejar Propina
              </span>
            </div>
            {showTipSection ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showTipSection && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selecciona un mozo para dejar propina:
              </p>
              
              <div className="space-y-2">
                {waiters.map((waiter) => (
                  <label
                    key={waiter.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedWaiter === waiter.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="waiter"
                        value={waiter.id}
                        checked={selectedWaiter === waiter.id}
                        onChange={(e) => setSelectedWaiter(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedWaiter === waiter.id
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedWaiter === waiter.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {waiter.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {waiter.percentage}%
                      </span>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${((ordersToShow?.total_amount_owed || 0) * waiter.percentage / 100).toFixed(2)}
                      </div>
                    </div>
                  </label>
                ))}
                
                {/* Custom Amount Option */}
                <label
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWaiter === 'custom'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="waiter"
                      value="custom"
                      checked={selectedWaiter === 'custom'}
                      onChange={(e) => setSelectedWaiter(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedWaiter === 'custom'
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedWaiter === 'custom' && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      Otro monto
                    </span>
                  </div>
                  {selectedWaiter === 'custom' && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">$</span>
                      <input
                        type="number"
                        value={customTipAmount}
                        onChange={(e) => setCustomTipAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  )}
                </label>
              </div>
              
              {selectedWaiter && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Propina seleccionada:
                    </span>
                    <span className="text-green-900 dark:text-green-100 font-bold">
                      ${calculateTipAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
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
        {selectedWaiter && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-gray-900 dark:text-white">${ordersToShow.total_amount_owed.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Propina:</span>
              <span className="text-gray-900 dark:text-white">${calculateTipAmount().toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">${getTotalWithTip().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
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
            `Pagar $${getTotalWithTip().toFixed(2)}`
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