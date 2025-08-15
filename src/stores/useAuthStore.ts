import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';
import { apiClient } from '../lib/api';

interface AuthStore extends AuthState {
  setToken: (token: string) => void;
  setTableId: (tableId: string) => void;
  validateToken: (token: string) => Promise<boolean>;
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