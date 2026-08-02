import { useState } from 'react';
import { PasswordInput, Button } from '@/shared/components/ui';
import { useAuth } from '../hooks';

interface ResetPasswordFormProps {
  email: string;
  code: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const ResetPasswordForm = ({ email, code, onBack, onSuccess }: ResetPasswordFormProps) => {
  const { resetPassword, isLoading, error } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePasswordChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    if (field === 'newPassword') setNewPassword(value);
    else setConfirmPassword(value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (newPassword.length < 8) newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await resetPassword(email, code, newPassword);
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-center">
      <p className="text-sm text-gray-600">
        Tạo mật khẩu mới cho tài khoản
        <br />
        <span className="font-semibold text-primary-500">{email}</span>
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-left">
          {error}
        </div>
      )}

      <div className="text-left space-y-3">
        <PasswordInput
          label="Mật khẩu mới"
          name="newPassword"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
          error={errors.newPassword || undefined}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword || undefined}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} size="md">
        Đặt lại mật khẩu
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs font-semibold text-gray-500 hover:text-primary-500 transition-colors cursor-pointer py-1"
      >
        ← Quay lại
      </button>
    </form>
  );
};
