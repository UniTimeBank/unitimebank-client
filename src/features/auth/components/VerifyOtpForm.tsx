import { useState, useEffect } from 'react';
import { Input, Button } from '@/shared/components/ui';
import { useAuth } from '../hooks';

interface VerifyOtpFormProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const VerifyOtpForm = ({ email, onBack, onSuccess }: VerifyOtpFormProps) => {
  const { verifyOtp, isLoading, error } = useAuth();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<string>('');

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    if (errors) setErrors('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrors('Mã OTP phải có 6 số');
      return;
    }

    const pendingName = sessionStorage.getItem('pending_display_name') || undefined;
    const result = await verifyOtp(email, code, 'REGISTER', pendingName);
    if (result.success) {
      sessionStorage.removeItem('pending_display_name');
      onSuccess();
    }
  };

  const handleResend = () => {
    // TODO: Implement resend OTP
    setCountdown(60); // 60 seconds cooldown
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      {email && (
        <p className="text-xs text-center text-gray-600 mb-2">
          Mã xác thực đã được gửi đến: <span className="font-semibold text-primary-500">{email}</span>
        </p>
      )}

      <Input
        name="code"
        type="text"
        placeholder="••••••"
        value={code}
        onChange={handleChange}
        error={errors || undefined}
        autoComplete="one-time-code"
        inputMode="numeric"
        className="text-center text-xl tracking-[0.5em] font-semibold"
      />

      <div className="flex justify-center text-xs">
        {countdown > 0 ? (
          <span className="text-gray-500">Gửi lại mã sau {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-primary-500 font-semibold hover:underline cursor-pointer"
          >
            Gửi lại mã OTP
          </button>
        )}
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} disabled={code.length !== 6} size="md">
        Xác thực tài khoản
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
