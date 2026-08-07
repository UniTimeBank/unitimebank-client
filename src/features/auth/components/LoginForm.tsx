import { useState } from 'react';
import { Input, PasswordInput, Button, Checkbox } from '@/shared/components/ui';
import { useAuth } from '../hooks';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToVerifyOtp: () => void;
}

export const LoginForm = ({ onSwitchToRegister: _onSwitchToRegister, onSwitchToVerifyOtp }: LoginFormProps) => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(formData.email, formData.password);
    if (result.success) {
      window.location.href = '/';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      <Input
        label="Địa chỉ Gmail"
        name="email"
        type="email"
        placeholder="bienthu@gmail.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email || undefined}
        autoComplete="email"
      />

      <PasswordInput
        label="Mật khẩu"
        labelRight={
          <button
            type="button"
            onClick={onSwitchToVerifyOtp}
            className="text-xs font-semibold text-primary-500 hover:text-primary-600 hover:underline cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        }
        name="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password || undefined}
        autoComplete="current-password"
      />

      <div className="pt-1 pb-2">
        <Checkbox
          label="Ghi nhớ đăng nhập trong 30 ngày"
          checked={rememberMe}
          onChange={(val) => setRememberMe(val)}
        />
      </div>

      <Button type="submit" fullWidth isLoading={isLoading} size="md">
        Đăng nhập vào Dashboard
      </Button>
    </form>
  );
};
