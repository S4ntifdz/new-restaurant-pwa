import React from 'react';
import { ArrowLeft, Sun, Moon, ShoppingCart, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../stores/useThemeStore';
import { useCartStore } from '../stores/useCartStore';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showCart?: boolean;
  showThemeToggle?: boolean;
  showCallWaiter?: boolean;
  tableNumber?: number;
  tableStatus?: string;
  onCallWaiter?: () => void;
}

export function Header({
  title,
  showBack = false,
  showCart = false,
  showThemeToggle = true,
  showCallWaiter = false,
  tableNumber,
  tableStatus,
  onCallWaiter,
}: HeaderProps) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();

  return (
    <header className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-orange-600 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <div>
          <h1 className="font-semibold text-lg">{title}</h1>
          {tableNumber && (
            <p className="text-orange-100 text-sm">
              Mesa {tableNumber} • {tableStatus || 'Ocupada'}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showCallWaiter && (
          <button
            onClick={onCallWaiter}
            className="bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Llamar Mozo
          </button>
        )}

        {showCart && (
          <button
            onClick={() => navigate(`/cart/${window.location.pathname.split('/')[2]}`)}
            className="relative p-2 hover:bg-orange-600 rounded transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-orange-600 rounded-lg transition-colors duration-200"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
      </div>
    </header>
  );
}