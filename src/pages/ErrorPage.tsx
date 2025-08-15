import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';

export function ErrorPage() {
  const location = useLocation();
  const error = location.state?.error || 'Ha ocurrido un error inesperado';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <ErrorMessage
        title="Acceso No Autorizado"
        message={error}
        action={
          <button
            onClick={() => window.location.href = '/'}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        }
      />
    </div>
  );
}