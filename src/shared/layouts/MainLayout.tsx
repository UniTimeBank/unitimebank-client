import type { ReactNode } from 'react';
import { useState } from 'react';
import { Header, Footer } from '@/shared/components';
import { SetPasswordModal } from '@/features/auth/components';
import { CreditTasksModal } from '@/features/user/components';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { useGetMeQuery, useGetOnboardingTasksQuery } from '@/core/api/user';
import { useGetMyWalletQuery } from '@/core/api/wallet/walletApi';

import { useOnboardingTaskToastNotifier } from '@/features/user/hooks';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });
  const { data: walletData } = useGetMyWalletQuery(undefined, {
    skip: !authUser,
    pollingInterval: 3000,
    refetchOnFocus: true,
  });
  const { data: onboardingData } = useGetOnboardingTasksQuery(undefined, {
    skip: !authUser,
    pollingInterval: 4000,
    refetchOnFocus: true,
  });
  useOnboardingTaskToastNotifier(onboardingData);

  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(() => {
    return sessionStorage.getItem('prompt_set_password') === 'true';
  }); 

  const [isCreditTasksOpen, setIsCreditTasksOpen] = useState(false);

  const handleCloseModal = () => {
    sessionStorage.removeItem('prompt_set_password');
    setIsSetPasswordOpen(false);
  };

  const userName = userProfile?.displayName || authUser?.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile?.avatarUrl;
  const userCredits = walletData?.availableBalance ?? 0;
  const hasUncompletedTasks = Boolean(
    onboardingData &&
      (!onboardingData.profileCompleted ||
        !onboardingData.scheduleCreated ||
        !onboardingData.skillAdded),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-800 antialiased">
      {/* Single Shared Header */}
      <Header
        userCredits={userCredits}
        userName={userName}
        userEmail={authUser?.email}
        avatarUrl={avatarUrl}
        trustScore={userProfile?.trustScore || 100}
        hasUncompletedTasks={hasUncompletedTasks}
        onOpenCreditTasks={() => setIsCreditTasksOpen(true)}
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

      {/* Reusable Credit Tasks Modal */}
      <CreditTasksModal
        isOpen={isCreditTasksOpen}
        onClose={() => setIsCreditTasksOpen(false)}
      />

      {/* Single Shared Footer */}
      <Footer />
    </div>
  );
};
