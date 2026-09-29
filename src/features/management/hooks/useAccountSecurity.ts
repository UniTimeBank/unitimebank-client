import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { useGetMeQuery } from '@/core/api/user';
import { useAuth } from '@/features/auth/hooks';
import { useGetSecurityStatusQuery } from '@/core/api/auth/authApi';

export type SecurityTab = 'CHANGE_PASSWORD' | 'SET_PASSWORD';

export const useAccountSecurity = () => {
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });
  const { changePassword, setPassword, logout, isLoading } = useAuth();

  const userId = authUser?.id || userProfile?.userId || userProfile?.id || '';
  const { data: securityStatus, isLoading: isSecurityLoading } = useGetSecurityStatusQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  // Check if account has a password
  // Default to true unless prompt_set_password is true or backend returns hasPassword === false
  const [hasPasswordState, setHasPasswordState] = useState<boolean | null>(() => {
    if (sessionStorage.getItem('prompt_set_password') === 'true') {
      return false;
    }
    return null;
  });

  useEffect(() => {
    if (securityStatus) {
      setHasPasswordState(securityStatus.hasPassword);
    }
  }, [securityStatus]);

  const hasPassword = hasPasswordState !== null ? hasPasswordState : (securityStatus?.hasPassword ?? true);

  // Active Tab: Automatically match password status
  const [activeTab, setActiveTab] = useState<SecurityTab>(hasPassword ? 'CHANGE_PASSWORD' : 'SET_PASSWORD');

  useEffect(() => {
    if (hasPassword) {
      setActiveTab('CHANGE_PASSWORD');
    } else {
      setActiveTab('SET_PASSWORD');
    }
  }, [hasPassword]);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPasswordChange, setNewPasswordChange] = useState('');
  const [confirmPasswordChange, setConfirmPasswordChange] = useState('');
  const [changeErrors, setChangeErrors] = useState<Record<string, string>>({});
  const [changeSuccessMessage, setChangeSuccessMessage] = useState('');

  // Set Password Form State
  const [newPasswordSet, setNewPasswordSet] = useState('');
  const [confirmPasswordSet, setConfirmPasswordSet] = useState('');
  const [setErrors, setSetErrors] = useState<Record<string, string>>({});
  const [setSuccessMessage, setSetSuccessMessage] = useState('');

  const userEmail = authUser?.email || securityStatus?.email || 'Chưa cập nhật email';
  const displayName = userProfile?.displayName || authUser?.displayName || authUser?.email?.split('@')[0] || 'Thành viên UniTime';
  const trustScore = userProfile?.trustScore ?? 100;
  const roleName = authUser?.role === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Sinh viên (Thành viên)';

  // Handle Change Password Submission
  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeErrors({});
    setChangeSuccessMessage('');

    const errors: Record<string, string> = {};
    if (!oldPassword) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    if (!newPasswordChange) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPasswordChange.length < 8) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (newPasswordChange && oldPassword && newPasswordChange === oldPassword) {
      errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }
    if (!confirmPasswordChange) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (newPasswordChange !== confirmPasswordChange) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setChangeErrors(errors);
      return;
    }

    if (!userId) {
      toast.error('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    const res = await changePassword(userId, oldPassword, newPasswordChange);
    if (res.success) {
      setChangeSuccessMessage('Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn.');
      toast.success('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPasswordChange('');
      setConfirmPasswordChange('');
    } else {
      setChangeErrors({ general: res.error || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.' });
      toast.error(res.error || 'Đổi mật khẩu thất bại');
    }
  }, [oldPassword, newPasswordChange, confirmPasswordChange, userId, changePassword]);

  // Handle Set Password Submission
  const handleSetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSetErrors({});
    setSetSuccessMessage('');

    const errors: Record<string, string> = {};
    if (!newPasswordSet) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPasswordSet.length < 8) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!confirmPasswordSet) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (newPasswordSet !== confirmPasswordSet) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setSetErrors(errors);
      return;
    }

    if (!userId) {
      toast.error('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    const res = await setPassword(userId, newPasswordSet);
    if (res.success) {
      sessionStorage.removeItem('prompt_set_password');
      setHasPasswordState(true);
      setChangeSuccessMessage('🎉 Bạn đã thiết lập mật khẩu thành công! Giờ đây bạn có thể đăng nhập bằng cả Google lẫn Email & Mật khẩu.');
      toast.success('Thiết lập mật khẩu thành công!');
      setNewPasswordSet('');
      setConfirmPasswordSet('');
      setActiveTab('CHANGE_PASSWORD');
    } else {
      setSetErrors({ general: res.error || 'Thiết lập mật khẩu thất bại. Vui lòng thử lại.' });
      toast.error(res.error || 'Thiết lập mật khẩu thất bại');
    }
  }, [newPasswordSet, confirmPasswordSet, userId, setPassword]);

  const switchTab = useCallback((tab: SecurityTab) => {
    setActiveTab(tab);
    setChangeErrors({});
    setChangeSuccessMessage('');
    setSetErrors({});
    setSetSuccessMessage('');
  }, []);

  return {
    // User info
    userId,
    userEmail,
    displayName,
    trustScore,
    roleName,
    hasPassword,
    isSecurityLoading,

    // Tab state
    activeTab,
    switchTab,

    // Change Password
    oldPassword,
    setOldPassword,
    newPasswordChange,
    setNewPasswordChange,
    confirmPasswordChange,
    setConfirmPasswordChange,
    changeErrors,
    setChangeErrors,
    changeSuccessMessage,
    handleChangePassword,

    // Set Password
    newPasswordSet,
    setNewPasswordSet,
    confirmPasswordSet,
    setConfirmPasswordSet,
    setErrors,
    setSetErrors,
    setSuccessMessage,
    handleSetPassword,

    // General Auth
    isLoading,
    logout,
  };
};
