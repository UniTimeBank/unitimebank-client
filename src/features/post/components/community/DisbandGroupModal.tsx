import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { useDeleteGroupMutation } from '@/core/api/community/communityApi';
import { toast } from 'react-hot-toast';

interface DisbandGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export const DisbandGroupModal: React.FC<DisbandGroupModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const navigate = useNavigate();
  const [confirmInput, setConfirmInput] = useState('');
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();

  const isConfirmed = confirmInput.trim() === groupName.trim();

  const handleDisband = async () => {
    if (!isConfirmed) return;

    try {
      await deleteGroup(groupId).unwrap();
      toast.success(`Đã giải tán nhóm "${groupName}" thành công.`);
      onClose();
      navigate('/community', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Không thể giải tán nhóm, vui lòng thử lại sau!';
      toast.error(msg);
    }
  };

  const handleClose = () => {
    setConfirmInput('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Giải tán nhóm học tập" size="md">
      <div className="space-y-4">
        {/* Warning Box */}
        <div className="p-4 bg-red-50/90 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 leading-relaxed font-medium">
            <p className="font-bold text-red-950">Hành động này không thể hoàn tác!</p>
            <p className="mt-1">
              Nhóm <strong>{groupName}</strong> cùng toàn bộ bài viết, bình luận và nội dung trao đổi sẽ bị xóa vĩnh viễn khỏi hệ thống. Tất cả thành viên sẽ tự động rời khỏi nhóm.
            </p>
          </div>
        </div>

        {/* Confirmation instruction */}
        <div className="space-y-2">
          <label className="text-xs text-gray-600 font-medium">
            Để xác nhận giải tán, vui lòng nhập chính xác tên nhóm: <strong className="text-gray-900 select-all">{groupName}</strong>
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder={`Nhập "${groupName}" để xác nhận...`}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDisband}
            isLoading={isDeleting}
            disabled={!isConfirmed || isDeleting}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Giải tán nhóm
          </Button>
        </div>
      </div>
    </Modal>
  );
};
