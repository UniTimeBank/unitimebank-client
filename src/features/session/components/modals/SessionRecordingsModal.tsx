import React, { useState } from 'react';
import {
  Video,
  Download,
  Trash2,
  ShieldAlert,
  Plus,
  Play,
  HardDrive,
  Info,
} from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import type { SessionRecordingClip } from '../../hooks';

export interface SessionRecordingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: SessionRecordingClip[];
  totalBytes: number;
  remainingBytes: number;
  usedPercentage: number;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDeleteClip: (id: string) => void;
  onDownloadClip: (id: string) => void;
  onReportWithClip?: (clip: SessionRecordingClip) => void;
}

export const SessionRecordingsModal: React.FC<SessionRecordingsModalProps> = ({
  isOpen,
  onClose,
  clips,
  totalBytes,
  remainingBytes,
  usedPercentage,
  isRecording,
  onStartRecording,
  onStopRecording,
  onDeleteClip,
  onDownloadClip,
  onReportWithClip,
}) => {
  const [selectedPreviewClip, setSelectedPreviewClip] = useState<SessionRecordingClip | null>(null);

  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const remainingMB = (remainingBytes / (1024 * 1024)).toFixed(1);

  // Quota color
  const getProgressColor = () => {
    if (usedPercentage >= 90) return 'bg-rose-500';
    if (usedPercentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Video Quay Màn Hình Buổi Học">
      <div className="space-y-4 pt-1">
        {/* Quota Progress Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Dung lượng buổi học</span>
              <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Tối đa 100 MB
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900">{totalMB} MB</span>
              <span className="text-xs text-slate-400"> / 100 MB</span>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(100, usedPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>Đã dùng: {usedPercentage}%</span>
            <span>Còn trống: {remainingMB} MB</span>
          </div>
        </div>

        {/* Informative Tip */}
        <div className="flex items-start gap-2.5 bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-blue-900 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            Bạn có thể ghi nhiều đoạn video khác nhau trong buổi học. Toàn bộ file được lưu tạm trên thiết bị và có thể tải về hoặc đính kèm làm minh chứng khi báo cáo vi phạm.
          </p>
        </div>

        {/* Video Preview Player (if user clicked preview) */}
        {selectedPreviewClip && (
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 truncate">{selectedPreviewClip.name}</span>
              <button
                type="button"
                onClick={() => setSelectedPreviewClip(null)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Đóng xem trước
              </button>
            </div>
            <video
              src={selectedPreviewClip.previewUrl}
              controls
              autoPlay
              className="w-full max-h-60 rounded-xl bg-black object-contain"
            />
          </div>
        )}

        {/* Clips List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Danh sách đoạn video ({clips.length})
          </h4>

          {clips.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                <Video className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Chưa có đoạn video nào</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Bấm nút &quot;Quay màn hình&quot; để bắt đầu ghi lại các khoảnh khắc quan trọng trong buổi học.
              </p>
              {!isRecording ? (
                <Button
                  onClick={() => {
                    onClose();
                    onStartRecording();
                  }}
                  variant="primary"
                  size="sm"
                  className="rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Bắt đầu quay video
                </Button>
              ) : (
                <Button
                  onClick={onStopRecording}
                  variant="danger"
                  size="sm"
                  className="rounded-xl shadow-xs"
                >
                  Dừng quay video hiện tại
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {clips.map((clip, index) => {
                const clipMB = (clip.sizeBytes / (1024 * 1024)).toFixed(1);
                const minutes = Math.floor(clip.durationSeconds / 60);
                const seconds = clip.durationSeconds % 60;
                const durationFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                return (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        onClick={() => setSelectedPreviewClip(clip)}
                        className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-slate-800 transition-colors group relative"
                        title="Bấm để xem trước video"
                      >
                        <Play className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            Đoạn #{index + 1}
                          </p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {clipMB} MB
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Thời lượng: {durationFormatted} • {clip.createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {/* Download */}
                      <button
                        type="button"
                        onClick={() => onDownloadClip(clip.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer"
                        title="Tải video này về máy tính"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Report violation with this clip */}
                      {onReportWithClip && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onReportWithClip(clip);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Đính kèm video này làm minh chứng báo cáo vi phạm"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDeleteClip(clip.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa đoạn này để giải phóng dung lượng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            {!isRecording && remainingBytes >= 1024 * 1024 && (
              <Button
                onClick={() => {
                  onClose();
                  onStartRecording();
                }}
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-300"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Quay thêm đoạn mới
              </Button>
            )}
            {isRecording && (
              <Button
                onClick={onStopRecording}
                variant="danger"
                size="sm"
                className="rounded-xl"
              >
                Dừng quay video hiện tại
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="primary" size="sm" className="rounded-xl px-5">
            Xong
          </Button>
        </div>
      </div>
    </Modal>
  );
};
