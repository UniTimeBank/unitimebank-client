import { useState } from 'react';
import { Modal, PasswordInput, Button } from '@/shared/components/ui';
import { useAuth } from '../hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SetPasswordModal = ({ isOpen, onClose, onSuccess }: SetPasswordModalProps) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const { setPassword, isLoading, error } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!newPassword) {
      setFormError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setFormError('Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!currentUser?.id) {
      setFormError('Vui lòng đăng nhập lại để thực hiện');
      return;
    }

    const result = await setPassword(currentUser.id, newPassword);
    if (result.success) {
      setSuccessMessage('Thiết lập mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu này.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thiết lập mật khẩu"
      description="Đặt mật khẩu mới để có thể đăng nhập bằng cả Google và Form Email + Mật khẩu."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {(error || formError) && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {formError || error}
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
            {successMessage}
          </div>
        )}

        <PasswordInput
          label="Mật khẩu mới"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Xác nhận mật khẩu mới"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Bỏ qua
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Lưu mật khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
