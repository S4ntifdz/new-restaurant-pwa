import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Users, User, CreditCard } from 'lucide-react';
import { apiClient } from '../lib/api';

interface OpenSessionsResponse {
  table_uuid: string;
  open_sessions: number;
}

export function PaymentSelectionPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSessions, setOpenSessions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unpaidOrders = location.state?.unpaidOrders;

  useEffect(() => {
    loadOpenSessions();
  }, []);

  const loadOpenSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: OpenSessionsResponse = await apiClient.getOpenSessions();
      setOpenSessions(response.open_sessions);
      
    } catch (error) {
      console.error('Error loading open sessions:', error);
      setError('Error al cargar información de la mesa');
    } finally {
      setLoading(false);
    }
  };

  const handlePayMyOrders = () => {
    navigate(`/payment/${tableId}`, {
      state: {
        paymentType: 'individual',
        unpaidOrders
      }
    });
  };

  const handlePayWholeTable = () => {
    navigate(`/payment/${tableId}`, {
      state: {
        paymentType: 'table',
        unpaidOrders
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Seleccionar Pago" showBack />
        <LoadingSpinner message="Cargando información de la mesa..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Seleccionar Pago" showBack />
        <ErrorMessage
          message={error}
          action={
            <button
              onClick={loadOpenSessions}
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
      <Header title="Seleccionar Pago" showBack />

      <div className="p-4 space-y-6">
        {/* Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Se han detectado {openSessions} persona{openSessions !== 1 ? 's' : ''} en la mesa
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ¿Cómo quieren pagar?
          </p>

          {/* Payment Options */}
          <div className="space-y-4">
            <button
              onClick={handlePayMyOrders}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
            >
              <User className="w-5 h-5" />
              Pagar solo lo mío
            </button>

            <button
              onClick={handlePayWholeTable}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
            >
              <CreditCard className="w-5 h-5" />
              Pagar toda la mesa
            </button>
          </div>
        </div>

        {/* Summary Info */}
        {unpaidOrders && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Resumen de órdenes pendientes:
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                {unpaidOrders.unpaid_orders_count} orden{unpaidOrders.unpaid_orders_count !== 1 ? 'es' : ''}
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                ${unpaidOrders.total_amount_owed.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}