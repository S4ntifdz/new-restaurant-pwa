import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { OffersCarousel } from '../components/OffersCarousel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuthStore } from '../stores/useAuthStore';
import { apiClient } from '../lib/api';
import { UnpaidOrdersResponse, Offer } from '../types';
import { Plus, CreditCard, Phone, X } from 'lucide-react';

export function DashboardPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrdersResponse | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [showCancelWaiterModal, setShowCancelWaiterModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/loading/${tableId}`);
      return;
    }

    // Check if we just created an order
    if (location.state?.orderCreated) {
      setShowOrderSuccess(true);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
      // Hide success message after 3 seconds
      setTimeout(() => setShowOrderSuccess(false), 3000);
    }

    loadData();
  }, [isAuthenticated, tableId, navigate, location.state]);

  const loadData = async () => {
    if (!tableId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load unpaid orders and offers
      const [unpaidOrdersData, offersData] = await Promise.all([
        apiClient.getUnpaidOrders(tableId),
        apiClient.getOffers()
      ]);
      
      setUnpaidOrders(unpaidOrdersData);
      setOffers(offersData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos de la mesa');
    } finally {
      setLoading(false);
    }
  };

  const handleCallWaiter = async () => {
    setShowWaiterModal(true);
  };

  const confirmCallWaiter = async () => {
    if (!tableId) return;
    
    try {
      const response = await apiClient.callWaiter(tableId);
      if (response.calling) {
        setWaiterCalled(true);
        setShowWaiterModal(false);
      }
    } catch (error) {
      console.error('Error calling waiter:', error);
      alert('Error al llamar al mozo. Intenta nuevamente.');
      setShowWaiterModal(false);
    }
  };

  const handleCancelWaiter = async () => {
    if (!tableId) return;
    
    try {
      await apiClient.cancelWaiterCall(tableId);
      setWaiterCalled(false);
      setShowCancelWaiterModal(false);
    } catch (error) {
      console.error('Error canceling waiter call:', error);
      alert('Error al cancelar llamado. Intenta nuevamente.');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'RECEIVED': 'Recibida',
      'IN_PREPARATION': 'En preparación',
      'READY': 'Lista',
      'DELIVERED': 'Entregada'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Cargando..." />
        <LoadingSpinner message="Cargando información de la mesa..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Error" />
        <ErrorMessage
          message={error}
          action={
            <button
              onClick={loadData}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title={`Mesa ${unpaidOrders?.table_number || '?'}`}
        tableNumber={unpaidOrders?.table_number}
        tableStatus="Ocupada"
        showCallWaiter
        onCallWaiter={handleCallWaiter}
      />

      <div className="p-4 space-y-6">
        {/* Order Success Message */}
        {showOrderSuccess && (
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-green-800 dark:text-green-200 font-medium">
                  ¡Orden creada exitosamente!
                </h3>
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Tu pedido ha sido enviado a la cocina
                  {location.state?.orderNumber && ` - Orden #${location.state.orderNumber}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Waiter Called Banner */}
        {waiterCalled && (
          <div 
            onClick={() => setShowCancelWaiterModal(true)}
            className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 cursor-pointer hover:bg-blue-150 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <Phone className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-blue-800 dark:text-blue-200 font-medium">
                    Mozo en camino
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    Toca para cancelar llamado
                  </p>
                </div>
              </div>
              <div className="animate-pulse">
                <Phone className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* Offers Carousel */}
        <OffersCarousel offers={offers} />

        {/* Órdenes en Proceso */}
        {unpaidOrders && unpaidOrders.orders.length > 0 && (
          <div className="space-y-4">
            {unpaidOrders.orders.map((order) => (
              <div key={order.id} className="bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                    Orden en Proceso
                  </h2>
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    #{order.order_number}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {order.order_products.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-orange-800 dark:text-orange-200">
{item.quantity}x {item.product_details?.name || item.offer_details?.name || 'Producto'}
                        
                      </span>
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        {getStatusText(order.status || 'RECEIVED')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumen de Cuenta */}
        {unpaidOrders && unpaidOrders.total_amount_owed > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumen de Cuenta
            </h2>
            
            <div className="space-y-3">
              {unpaidOrders.orders.flatMap(order => 
                order.order_products.map((item, index) => (
                  <div key={`${order.id}-${index}`} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">
{item.quantity}x {item.product_details?.name || item.offer_details?.name || 'Producto'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
${((item.product_details?.price || item.offer_details?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${unpaidOrders.total_amount_owed.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/menu/${tableId}`)}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ordenar
          </button>
          
          {unpaidOrders && unpaidOrders.total_amount_owed > 0 && (
            <button
              onClick={() => navigate(`/payment/${tableId}`, { 
                state: { unpaidOrders } 
              })}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Pagar Mesa
            </button>
          )}
        </div>
      </div>

      {/* Waiter Call Confirmation Modal */}
      {showWaiterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ¿Llamar al mozo?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                El mozo será notificado y se dirigirá a tu mesa
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWaiterModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCallWaiter}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Llamar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Waiter Call Modal */}
      {showCancelWaiterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ¿Cancelar llamado?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Se cancelará la notificación al mozo
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelWaiterModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Mantener
                </button>
                <button
                  onClick={handleCancelWaiter}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar Llamado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}