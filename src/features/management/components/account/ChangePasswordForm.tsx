import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { PasswordInput, Button } from '@/shared/components/ui';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ChangePasswordFormProps {
  oldPassword: string;
  setOldPassword: (val: string) => void;
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

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  oldPassword,
  setOldPassword,
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
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Thành công!</div>
            <div>{successMessage}</div>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Không thể đổi mật khẩu</div>
            <div>{errors.general}</div>
          </div>
        </div>
      )}

      <PasswordInput
        label="Mật khẩu hiện tại"
        placeholder="Nhập mật khẩu đang dùng"
        value={oldPassword}
        onChange={(e) => {
          setOldPassword(e.target.value);
          if (errors.oldPassword) setErrors((p) => ({ ...p, oldPassword: '' }));
        }}
        error={errors.oldPassword}
        autoComplete="current-password"
      />

      <PasswordInput
        label="Mật khẩu mới"
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
          Lưu Thay Đổi Mật Khẩu
        </Button>
      </div>
    </form>
  );
};
