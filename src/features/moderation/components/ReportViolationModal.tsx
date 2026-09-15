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
import { REPORT_CATEGORIES } from '../utils';
import { useReportViolationForm } from '../hooks';

export interface ReportViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
  targetType?: string;
  targetId?: string;
  onSuccess?: () => void;
}

export const ReportViolationModal: React.FC<ReportViolationModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = 'Thành viên này',
  targetType = 'USER',
  targetId,
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
    targetType,
    targetId,
    onSuccess,
    onClose,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Báo cáo vi phạm">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {REPORT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/30 shadow-2xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="pr-3 flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900">{cat.label}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{cat.desc}</p>
                  </div>
                  <Radio
                    id={`report-category-${cat.id}`}
                    name="reportCategory"
                    checked={isSelected}
                    onChange={() => setCategory(cat.id)}
                    size="sm"
                  />
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
                        alt="Xem trước"
                        className="w-9 h-9 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileImage className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa file này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Dropzone (When < maxFiles) */}
          {selectedFiles.length < maxFiles && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 rounded-2xl p-3 text-center cursor-pointer transition-all group"
            >
              {selectedFiles.length === 0 ? (
                <>
                  <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 mx-auto mb-1 transition-colors" />
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-900 transition-colors">
                    Chọn ảnh hoặc video từ thiết bị
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, MP4 (Tối đa {maxFiles} file, mỗi file &le; 10MB)
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 group-hover:text-emerald-700 py-0.5">
                  <Plus className="w-4 h-4" />
                  <span>Thêm file bằng chứng khác ({selectedFiles.length}/{maxFiles})</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 border-red-600 min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isUploadingFiles ? 'Đang tải file...' : 'Đang gửi...'}</span>
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
