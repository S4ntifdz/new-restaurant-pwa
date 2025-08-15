import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuthStore } from '../stores/useAuthStore';
import { useTokenFromUrl } from '../hooks/useTokenFromUrl';

export function LoadingPage() {
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();
  const { validateToken, isValidating, error, setTableId } = useAuthStore();
  const token = useTokenFromUrl();

  useEffect(() => {
    const handleAuth = async () => {
      if (!token) {
        navigate('/error', { 
          state: { 
            error: 'No se encontró token de acceso en la URL' 
          } 
        });
        return;
      }

      if (!tableId) {
        navigate('/error', { 
          state: { 
            error: 'ID de mesa no válido' 
          } 
        });
        return;
      }

      setTableId(tableId);
      const isValid = await validateToken(token);
      
      if (isValid) {
        navigate(`/dashboard/${tableId}`, { replace: true });
      } else {
        navigate('/error', { 
          state: { 
            error: 'Acceso no autorizado. Token inválido o expirado.' 
          } 
        });
      }
    };

    handleAuth();
  }, [token, tableId, validateToken, navigate, setTableId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorMessage
          title="Error de Autenticación"
          message={error}
          action={
            <button
              onClick={() => window.location.reload()}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner 
        message="Validando acceso..." 
        size="lg"
      />
    </div>
  );
}