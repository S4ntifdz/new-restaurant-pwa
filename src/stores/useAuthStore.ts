import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';
import { apiClient } from '../lib/api';

interface ValidationResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
}

interface AuthStore extends AuthState {
  setToken: (token: string) => void;
  setTableId: (tableId: string) => void;
  validateToken: (token: string) => Promise<boolean>;
  validateTokenWithIdentifier: (token: string, identifier: string) => Promise<ValidationResult>;
  logout: () => void;
  setError: (error: string | null) => void;
  setValidating: (isValidating: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      isValidating: false,
      error: null,
      tableId: null,

      setToken: (token: string) => {
        apiClient.setToken(token);
        set({ token, isAuthenticated: true });
      },

      setTableId: (tableId: string) => {
        set({ tableId });
      },

      validateToken: async (token: string) => {
        set({ isValidating: true, error: null });
        
        console.log('Starting token validation for:', token.substring(0, 20) + '...');
        
        try {
          apiClient.setToken(token);
          
          const isValid = await apiClient.validateJWT();
          
          console.log('Token validation result:', isValid);
          
          if (isValid === true) {
            set({ 
              token, 
              isAuthenticated: true, 
              isValidating: false,
              error: null 
            });
            return true;
          } else {
            set({ 
              token: null, 
              isAuthenticated: false, 
              isValidating: false,
              error: 'Token inválido o expirado' 
            });
            return false;
          }
        } catch (error) {
          console.error('Token validation error:', error);
          set({ 
            token: null, 
            isAuthenticated: false, 
            isValidating: false,
            error: 'Error de conexión con el servidor' 
          });
          return false;
        }
      },

      validateTokenWithIdentifier: async (token: string, identifier: string) => {
        set({ isValidating: true, error: null });
        
        console.log('Starting token validation with identifier:', identifier);
        
        try {
          const result = await apiClient.validateJWTWithIdentifier(token, identifier);
          
          if (result.valid && result.session_token) {
            // Set the session token as the new auth token
            apiClient.setToken(result.session_token);
            
            set({ 
              token: result.session_token, 
              isAuthenticated: true, 
              isValidating: false,
              error: null 
            });
            
            return {
              success: true,
              sessionToken: result.session_token
            };
          } else {
            set({ 
              token: null, 
              isAuthenticated: false, 
              isValidating: false,
              error: 'Token inválido o identificador no válido' 
            });
            
            return {
              success: false,
              error: 'Token inválido o identificador no válido'
            };
          }
        } catch (error) {
          console.error('Token validation with identifier error:', error);
          const errorMessage = 'Error de conexión con el servidor';
          
          set({ 
            token: null, 
            isAuthenticated: false, 
            isValidating: false,
            error: errorMessage 
          });
          
          return {
            success: false,
            error: errorMessage
          };
        }
      },

      logout: () => {
        set({ 
          isAuthenticated: false, 
          token: null, 
          tableId: null,
          error: null 
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setValidating: (isValidating: boolean) => {
        set({ isValidating });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        tableId: state.tableId 
      }),
    }
  )
);