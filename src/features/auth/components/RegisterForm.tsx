import { useState } from 'react';
import { Input, PasswordInput, Button } from '@/shared/components/ui';
import { useAuth } from '../hooks';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterForm = ({ onSwitchToLogin: _onSwitchToLogin, onRegisterSuccess }: RegisterFormProps) => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    } else if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = 'Chỉ chấp nhận email Gmail';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    sessionStorage.setItem('pending_display_name', formData.displayName.trim());
    const result = await register(formData.email, formData.password, formData.displayName.trim());
    if (result.success) {
      onRegisterSuccess();
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
        label="Họ và tên"
        name="displayName"
        type="text"
        placeholder="Nguyễn Văn A"
        value={formData.displayName}
        onChange={handleChange}
        error={errors.displayName || undefined}
        autoComplete="name"
      />

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
        name="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password || undefined}
        autoComplete="new-password"
      />

      <PasswordInput
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword || undefined}
        autoComplete="new-password"
      />

      <Button type="submit" fullWidth isLoading={isLoading} size="md">
        Tạo tài khoản ngay
      </Button>
    </form>
  );
};
