import type { ReactNode } from 'react';
import { useState } from 'react';
import logoGreen from '@/assets/images/Logo.png';
import { SetPasswordModal } from '@/features/auth/components';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  // Khởi tạo state trực tiếp từ sessionStorage để không bị reset khi component re-render/hydrate
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(() => {
    return sessionStorage.getItem('prompt_set_password') === 'true';
  });

  const handleCloseModal = () => {
    sessionStorage.removeItem('prompt_set_password');
    setIsSetPasswordOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoGreen} alt="UniTime Bank Logo" className="h-9 w-auto object-contain" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              UniTime Bank
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-500 border border-primary-200 text-xs font-semibold">
              <span>⏱️ Số dư: 120 credits</span>
            </div>

            {/* Set Password Button */}
            <button
              onClick={() => setIsSetPasswordOpen(true)}
              className="text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg border border-primary-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🔑</span>
              <span className="hidden sm:inline">Đặt mật khẩu</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
              }}
              className="text-xs font-semibold text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Reusable Set Password Modal */}
      <SetPasswordModal
        isOpen={isSetPasswordOpen}
        onClose={handleCloseModal}
        onSuccess={handleCloseModal}
      />
    </div>
  );
};
