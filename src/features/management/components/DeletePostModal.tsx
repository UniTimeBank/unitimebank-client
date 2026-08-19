import React from 'react';
import { Button, Modal } from '@/shared/components/ui';

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  postTitle?: string;
  isDeleting?: boolean;
}

export const DeletePostModal: React.FC<DeletePostModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  postTitle,
  isDeleting = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={!isDeleting}
    >
      <div className="space-y-4 pt-1">
        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {title || 'Xác nhận xóa bài đăng'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bạn có chắc chắn muốn xóa bài{' '}
            {postTitle ? (
              <span className="font-semibold text-slate-800">
                &ldquo;{postTitle}&rdquo;
              </span>
            ) : (
              'này'
            )}
            ? Bài viết sẽ được gỡ khỏi trang tìm kiếm và danh sách quản lý của bạn.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl px-4.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa bài đăng'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
