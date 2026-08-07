import type { ReactNode } from 'react';
import { useState } from 'react';
import { Header, Footer } from '@/shared/components';
import { SetPasswordModal } from '@/features/auth/components';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { useGetMeQuery } from '@/core/api/user';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });

  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(() => {
    return sessionStorage.getItem('prompt_set_password') === 'true';
  });

  const handleCloseModal = () => {
    sessionStorage.removeItem('prompt_set_password');
    setIsSetPasswordOpen(false);
  };

  const userName = userProfile?.displayName || authUser?.email?.split('@')[0] || 'Alex';
  const avatarUrl = userProfile?.avatarUrl;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-800 antialiased">
      {/* Single Shared Header */}
      <Header
        userCredits={120}
        userName={userName}
        avatarUrl={avatarUrl}
        onOpenSetPassword={() => setIsSetPasswordOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Reusable Set Password Modal */}
      <SetPasswordModal
        isOpen={isSetPasswordOpen}
        onClose={handleCloseModal}
        onSuccess={handleCloseModal}
      />

      {/* Single Shared Footer */}
      <Footer />
    </div>
  );
};
