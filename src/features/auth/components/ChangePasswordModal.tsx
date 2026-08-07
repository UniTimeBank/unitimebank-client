import { useState } from 'react';
import { Modal, PasswordInput, Button } from '@/shared/components/ui';
import { useAuth } from '../hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
  const { changePassword, isLoading, error } = useAuth();
  const user = useAppSelector(selectCurrentUser);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!oldPassword) newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (newPassword.length < 8) newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (newPassword === oldPassword) newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user?.id) {
      setErrors({ oldPassword: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.' });
      return;
    }

    const result = await changePassword(user.id, oldPassword, newPassword);
    if (result.success) {
      setSuccess(true);
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="Đổi mật khẩu">
      {success ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Đổi mật khẩu thành công!</h3>
          <p className="text-sm text-gray-600 mb-4">Lần đăng nhập sau, hãy dùng mật khẩu mới.</p>
          <Button onClick={handleClose} fullWidth>Đóng</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          <PasswordInput
            label="Mật khẩu hiện tại"
            name="oldPassword"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              if (errors.oldPassword) setErrors((p) => ({ ...p, oldPassword: '' }));
            }}
            error={errors.oldPassword || undefined}
            autoComplete="current-password"
          />

          <PasswordInput
            label="Mật khẩu mới"
            name="newPassword"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: '' }));
            }}
            error={errors.newPassword || undefined}
            autoComplete="new-password"
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
            }}
            error={errors.confirmPassword || undefined}
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Xác nhận đổi mật khẩu
          </Button>
        </form>
      )}
    </Modal>
  );
};