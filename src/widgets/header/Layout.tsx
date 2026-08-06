// src/widgets/header/Layout.tsx
import { Link } from 'react-router-dom';
import { useStore } from '../../app/providers/StoreProvider';
import { useAuthStore } from '../../app/hooks/useAuthStore';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { AuthModal } from '../../features/auth/ui/AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = observer(({ children }: LayoutProps) => {
  const { currentUser, logout } = useStore();
  const authStore = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
    authStore.clearError();
  };

  // Use auth store user if available, fallback to legacy currentUser
  const displayUser = authStore.user || currentUser;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 w-full">
        <div className="px-6 h-16 flex items-center justify-between w-full">
          <Link to="/" className="text-2xl font-bold text-[#00AAFF] flex items-center gap-1 hover:opacity-80 transition-opacity">
            <span className="text-gray-900">Цепочка</span>Обмена
          </Link>

          <div className="flex items-center gap-4">
            {displayUser ? (
              <div className="flex items-center gap-4">
                 <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-gray-50 py-1.5 pl-1.5 pr-4 rounded-full border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#00AAFF] flex items-center justify-center text-xs font-bold">
                    {displayUser.username.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{displayUser.username}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className="px-5 py-2 bg-[#00AAFF] text-white rounded-lg text-sm font-medium hover:bg-[#0095E0] transition-colors shadow-sm"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full px-6 py-6">
        {children}
      </main>

      <footer className="bg-white border-t mt-auto py-6 w-full">
        <div className="px-6 text-center text-gray-400 text-xs">
          © 2026 Цепочка Обмена. MVP Хакатон.
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseModal} />
    </div>
  );
});