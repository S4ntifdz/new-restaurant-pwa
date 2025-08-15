import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuthStore } from '../stores/useAuthStore';

export function JWTTokenPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { validateToken, isValidating, error, setTableId } = useAuthStore();

  useEffect(() => {
    const handleAuth = async () => {
      if (!token) {
        console.log('No token found in URL');
        navigate('/error', { 
          state: { 
            error: 'No se encontró token de acceso en la URL' 
          } 
        });
        return;
      }

      console.log('Token from URL:', token);
      
      try {
        // Decode JWT to extract table_uuid
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload);
        
        const tableId = payload.table_uuid;
        
        if (!tableId) {
          console.log('No table_uuid found in JWT payload');
          navigate('/error', { 
            state: { 
              error: 'Token JWT no contiene información de mesa válida' 
            } 
          });
          return;
        }

        console.log('Setting table ID:', tableId);
        setTableId(tableId);
        
        console.log('Starting token validation...');
        const isValid = await validateToken(token);
        console.log('Token validation completed. Is valid:', isValid);
        
        if (isValid) {
          console.log('Redirecting to dashboard...');
          navigate(`/dashboard/${tableId}`, { replace: true });
        } else {
          console.log('Token validation failed, redirecting to error');
          navigate('/error', { 
            state: { 
              error: 'Acceso no autorizado. Token inválido o expirado.' 
            } 
          });
        }
      } catch (decodeError) {
        console.error('Error decoding JWT:', decodeError);
        navigate('/error', { 
          state: { 
            error: 'Token JWT malformado o inválido' 
          } 
        });
      }
    };

    handleAuth();
  }, [token, validateToken, navigate, setTableId]);

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