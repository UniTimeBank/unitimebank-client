import { useState } from 'react';
import { Input, Button } from '@/shared/components/ui';
import { useAuth } from '../hooks';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordForm = ({ onBack, onSuccess }: ForgotPasswordFormProps) => {
  const { forgotPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors) setErrors('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors('Vui lòng nhập email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors('Email không hợp lệ');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      onSuccess(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-center">
      <p className="text-sm text-gray-600">
        Nhập email của bạn, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-left">
          {error}
        </div>
      )}

      <div className="text-left">
        <Input
          label="Địa chỉ Gmail"
          name="email"
          type="email"
          placeholder="bienthu@gmail.com"
          value={email}
          onChange={handleChange}
          error={errors || undefined}
          autoComplete="email"
        />
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} size="md">
        Gửi mã OTP
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs font-semibold text-gray-500 hover:text-primary-500 transition-colors cursor-pointer py-1"
      >
        ← Quay lại Đăng nhập
      </button>
    </form>
  );
};
