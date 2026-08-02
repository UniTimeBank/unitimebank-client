import { useState, useEffect } from 'react';
import { Input, Button } from '@/shared/components/ui';

interface ForgotOtpFormProps {
  email: string;
  onBack: () => void;
  onResend: () => void;
  onSuccess: (code: string) => void;
}

export const ForgotOtpForm = ({ email, onBack, onResend, onSuccess }: ForgotOtpFormProps) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrors('Mã OTP phải có 6 số');
      return;
    }
    onSuccess(code);
  };

  const handleResend = () => {
    onResend();
    setCountdown(60);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-center">
      <p className="text-sm text-gray-600">
        Mã xác thực đã được gửi đến
        <br />
        <span className="font-semibold text-primary-500">{email}</span>
      </p>

      {errors && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-left">
          {errors}
        </div>
      )}

      <div className="text-left">
        <Input
          label="Mã OTP"
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
      </div>

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

      <Button type="submit" fullWidth disabled={code.length !== 6} size="md">
        Tiếp tục
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs font-semibold text-gray-500 hover:text-primary-500 transition-colors cursor-pointer py-1"
      >
        ← Đổi email khác
      </button>
    </form>
  );
};