import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, FileText, Loader2, Link2 } from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { useReportViolationMutation } from '@/core/api/moderation';
import type { ReportCategory } from '../types';
import toast from 'react-hot-toast';

export interface ReportViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
  targetType?: string;
  targetId?: string;
  onSuccess?: () => void;
}

const REPORT_CATEGORIES: Array<{ id: ReportCategory; label: string; desc: string }> = [
  { id: 'AFK_ABUSE', label: 'Vắng mặt / Không đến lớp', desc: 'Người dùng không vào phòng học hoặc rời phòng giữa chừng không lý do' },
  { id: 'TOXIC_LANGUAGE', label: 'Lời nói / Thái độ xúc phạm', desc: 'Có hành vi thiếu tôn trọng, quấy rối hoặc ngôn từ thù địch' },
  { id: 'FRAUD', label: 'Gian lận Credit / Lừa đảo', desc: 'Yêu cầu thanh toán tiền mặt ngoài hệ thống hoặc lừa đảo thời gian' },
  { id: 'INAPPROPRIATE_CONTENT', label: 'Nội dung không phù hợp', desc: 'Chia sẻ tài liệu vi phạm bản quyền hoặc hình ảnh phản cảm' },
  { id: 'SPAM', label: 'Spam / Tin nhắn rác', desc: 'Gửi quảng cáo hoặc spam tin nhắn liên tục' },
  { id: 'OTHER', label: 'Lý do khác', desc: 'Các vấn đề phát sinh khác trong quá trình trao đổi' },
];

export const ReportViolationModal: React.FC<ReportViolationModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'Thành viên này',
  targetType = 'USER',
  targetId,
  onSuccess,
}) => {
  const [category, setCategory] = useState<ReportCategory>('AFK_ABUSE');
  const [description, setDescription] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');

  const [reportViolation, { isLoading }] = useReportViolationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết sự cố');
      return;
    }

    try {
      const evidenceUrls = evidenceUrl.trim()
        ? [{ url: evidenceUrl.trim(), kind: 'SCREENSHOT' }]
        : undefined;

      await reportViolation({
        targetUserId,
        targetType,
        targetId: targetId || targetUserId,
        category,
        description: description.trim(),
        evidenceUrls,
      }).unwrap();

      toast.success('Báo cáo của bạn đã được tiếp nhận và sẽ được xử lý sớm nhất.');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || 'Không thể gửi báo cáo vi phạm, vui lòng thử lại sau.';
      toast.error(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Báo cáo vi phạm">
      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        <div className="flex items-start gap-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-amber-800">
            Báo cáo đối với <span className="font-bold text-amber-950">{targetUserName}</span>. Mọi thông tin bạn cung cấp sẽ được đội ngũ quản trị UniTime Bank kiểm duyệt bảo mật và công minh.
          </p>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>Loại vi phạm *</span>
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {REPORT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <label
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-50/70 border-primary-400 text-primary-950'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="pr-3">
                    <p className="text-xs font-bold text-gray-900">{cat.label}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{cat.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="reportCategory"
                    checked={isSelected}
                    onChange={() => setCategory(cat.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span>Mô tả sự việc chi tiết *</span>
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nêu rõ mốc thời gian, chi tiết hành vi và những gì đã diễn ra..."
            className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Evidence Link */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Link hình ảnh / video bằng chứng (tùy chọn)</span>
          </label>
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://drive.google.com/... hoặc link ảnh màn hình"
            className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 border-red-600 min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang gửi...</span>
              </span>
            ) : (
              'Gửi báo cáo'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
