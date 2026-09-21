import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  FileText,
  Loader2,
  UploadCloud,
  FileImage,
  Trash2,
  Plus,
} from 'lucide-react';
import { Modal, Button, Radio } from '@/shared/components/ui';
import { getReportCategoriesByRole } from '../utils';
import { useReportViolationForm } from '../hooks';

export interface ReportViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
  targetRole?: 'LEARNER' | 'MENTOR' | string;
  targetType?: string;
  targetId?: string;
  initialFiles?: File[];
  onSuccess?: () => void;
}

export const ReportViolationModal: React.FC<ReportViolationModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'Thành viên này',
  targetRole,
  targetType = 'USER',
  targetId,
  initialFiles,
  onSuccess,
}) => {
  const {
    category,
    setCategory,
    description,
    setDescription,
    selectedFiles,
    isSubmitting,
    isUploadingFiles,
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
    handleSubmit,
    maxFiles,
  } = useReportViolationForm({
    targetUserId,
    targetUserName,
    targetRole,
    targetType,
    targetId,
    initialFiles,
    onSuccess,
    onClose,
  });

  const categories = getReportCategoriesByRole(targetRole);

  const roleLabel =
    targetRole === 'LEARNER'
      ? 'Học viên'
      : targetRole === 'MENTOR'
      ? 'Người hướng dẫn (Mentor)'
      : 'Thành viên';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Báo cáo vi phạm">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="flex items-start gap-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 text-amber-900">
          <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-amber-800">
            Báo cáo vi phạm đối với <span className="font-bold text-amber-950">{targetUserName}</span> ({roleLabel}). Mọi thông tin bạn cung cấp sẽ được đội ngũ quản trị UniTime Bank kiểm duyệt bảo mật.
          </p>
        </div>

        {/* Categories (Chỉ chọn 1 duy nhất, đổi lựa chọn sẽ tắt mục cũ) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Loại vi phạm *</span>
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/30 shadow-2xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="pr-3 flex-1 min-w-0">
                    <p className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-gray-900'}`}>
                      {cat.label}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="shrink-0 pointer-events-none">
                    <Radio
                      id={`report-category-${cat.id}`}
                      name="reportCategorySingle"
                      checked={isSelected}
                      onChange={() => {}}
                      size="sm"
                    />
                  </div>
                </div>
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

        {/* File Upload Evidence (Max 3 files) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-gray-500" />
              <span>Ảnh / Video bằng chứng</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {selectedFiles.length}/{maxFiles} file
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* List of Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 mb-2">
              {selectedFiles.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/90 rounded-2xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt="preview"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                        <FileImage className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-2 shrink-0 cursor-pointer"
                    title="Xóa file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-gray-300 rounded-2xl p-3 text-center hover:bg-gray-50/80 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-600">
                Chọn ảnh hoặc video từ thiết bị
              </span>
              <span className="text-[10px] text-slate-400">
                PNG, JPG, MP4, WEBM (Ảnh ≤ 10MB, Video ≤ 100MB)
              </span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold min-w-[100px] flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isUploadingFiles ? 'Đang tải file...' : 'Đang gửi...'}</span>
              </>
            ) : (
              <span>Gửi báo cáo</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportViolationModal;
