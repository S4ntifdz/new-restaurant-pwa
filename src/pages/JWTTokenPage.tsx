import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function JWTTokenPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {


    if (!token) {
      navigate('/error', { 
        state: { 
          error: 'No se encontró token de acceso en la URL' 
        } 
      });
      return;
    }

    // Redirect to identification page with the token
    navigate(`/identify/${token}`, { replace: true });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner 
        message="Redirigiendo..." 
        size="lg"
      />
    </div>
  );
}

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