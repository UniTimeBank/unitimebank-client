import React from 'react';
import { Modal, Button } from '@/shared/components/ui';

interface ParticipantActionModalProps {
  confirmAction: {
    type: 'KICK' | 'BLOCK';
    userId: string;
    userName: string;
  } | null;
  actionReason: string;
  onChangeReason: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const ParticipantActionModal: React.FC<ParticipantActionModalProps> = ({
  confirmAction,
  actionReason,
  onChangeReason,
  onClose,
  onConfirm,
}) => {
  if (!confirmAction) return null;

  const isKick = confirmAction.type === 'KICK';

  return (
    <Modal
      isOpen={Boolean(confirmAction)}
      onClose={onClose}
      size="sm"
      title={isKick ? 'Mời thành viên ra khỏi phòng' : 'Cấm thành viên vào phòng'}
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs text-slate-600 leading-relaxed">
          {isKick ? (
            <>
              Bạn có chắc chắn muốn mời <strong className="text-slate-900">{confirmAction.userName}</strong> rời khỏi phòng học này không?
            </>
          ) : (
            <>
              Bạn có chắc muốn chặn vĩnh viễn <strong className="text-slate-900">{confirmAction.userName}</strong> không thể tham gia lại phòng học này?
            </>
          )}
        </p>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Lý do (không bắt buộc):
          </label>
          <input
            type="text"
            value={actionReason}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Nhập lý do ngắn gọn..."
            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className={`text-xs font-semibold text-white ${
              isKick
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isKick ? 'Mời rời phòng' : 'Xác nhận cấm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
