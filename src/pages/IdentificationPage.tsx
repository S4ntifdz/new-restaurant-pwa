import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function IdentificationPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { validateTokenWithIdentifier, isValidating, error } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim() || !token) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await validateTokenWithIdentifier(token, identifier.trim());
      
      if (result.success) {
        // Decode the session token to get table_uuid
        const payload = JSON.parse(atob(result.sessionToken!.split('.')[1]));
        const tableId = payload.table_uuid;
        
        navigate(`/dashboard/${tableId}`, { replace: true });
      }
    } catch (error) {
      console.error('Error during identification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <ErrorMessage
          title="Error de Identificación"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Bienvenido!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Para continuar, ingresa tu email o un apodo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="identifier" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email o Apodo
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ejemplo@email.com o tu apodo"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={isSubmitting || isValidating}
            />
          </div>

          <button
            type="submit"
            disabled={!identifier.trim() || isSubmitting || isValidating}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isSubmitting || isValidating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando...
              </div>
            ) : (
              'Continuar'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tu información se usa solo para identificarte en esta sesión
          </p>
        </div>
      </div>
    </div>
  );
}