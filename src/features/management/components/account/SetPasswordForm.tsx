import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { PasswordInput, Button } from '@/shared/components/ui';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface SetPasswordFormProps {
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  successMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const SetPasswordForm: React.FC<SetPasswordFormProps> = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  successMessage,
  onSubmit,
  isLoading,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Contextual Infobox for Google Users */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Dành cho tài khoản Google hoặc chưa có mật khẩu:</div>
          <div className="leading-relaxed text-amber-800">
            Tính năng này cho phép bạn thiết lập mật khẩu cá nhân mà không cần nhập mật khẩu cũ. Sau khi đặt, bạn có thể đăng nhập bằng cả <strong>Google</strong> lẫn <strong>Email & Mật khẩu</strong> trên mọi thiết bị và ứng dụng di động UniTime.
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Thiết lập thành công!</div>
            <div>{successMessage}</div>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Lỗi thiết lập mật khẩu</div>
            <div>{errors.general}</div>
          </div>
        </div>
      )}

      <PasswordInput
        label="Mật khẩu mới muốn đặt"
        placeholder="Tối thiểu 8 ký tự (chữ hoa, thường, số)"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' }));
        }}
        error={errors.newPassword}
        autoComplete="new-password"
      />

      <PasswordStrengthMeter password={newPassword} />

      <PasswordInput
        label="Xác nhận mật khẩu mới"
        placeholder="Nhập lại mật khẩu mới"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
        }}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <div className="pt-2 flex items-center justify-end gap-3">
        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20"
        >
          Xác Nhận Thiết Lập Mật Khẩu
        </Button>
      </div>
    </form>
  );
};
