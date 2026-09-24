import React from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Send,
  Link as LinkIcon,
  HelpCircle,
  FolderDown,
  Users,
  BookOpen,
} from 'lucide-react';
import { Modal, Button } from '@/shared/components/ui';
import { GROUP_POST_TAG_CONFIG } from '@/features/post/constants';
import type { GroupPostTag } from '@/features/post/types';
import type { useCreateGroupPostForm } from '@/features/post/hooks';
import { useAppSelector } from '@/core/store';
import { selectCurrentUser } from '@/core/store';

interface CreateGroupPostModalProps {
  form: ReturnType<typeof useCreateGroupPostForm>;
  groupName: string;
  isMember?: boolean;
}

const TAG_ICONS: Record<GroupPostTag, React.ReactNode> = {
  QA: <HelpCircle className="w-3.5 h-3.5" />,
  DOCUMENT: <FolderDown className="w-3.5 h-3.5" />,
  STUDY_BUDDY: <Users className="w-3.5 h-3.5" />,
  GENERAL: <BookOpen className="w-3.5 h-3.5" />,
};

export const CreateGroupPostModal: React.FC<CreateGroupPostModalProps> = ({
  form,
  groupName,
  isMember,
}) => {
  const currentUser = useAppSelector(selectCurrentUser);

  const {
    isOpen,
    closeModal,
    postContent,
    setPostContent,
    selectedTag,
    setSelectedTag,
    imageUrl,
    setImageUrl,
    isDragOver,
    setIsDragOver,
    isUrlInputOpen,
    setIsUrlInputOpen,
    urlDraft,
    setUrlDraft,
    fileInputRef,
    isUploading,
    isPosting,
    handleFileChange,
    handleDrop,
    handleApplyUrl,
    handleSubmit,
  } = form;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Tạo bài viết trong nhóm"
      description={`Chia sẻ kiến thức, bài tập hoặc thảo luận cùng nhóm "${groupName}"`}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* User Info & Post Tag Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {currentUser?.fullName || 'Bạn'}
              </p>
              <p className="text-[11px] text-gray-400 font-medium">Thành viên nhóm</p>
            </div>
          </div>

          {/* Topic / Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(GROUP_POST_TAG_CONFIG) as GroupPostTag[]).map((tagKey) => {
              const cfg = GROUP_POST_TAG_CONFIG[tagKey];
              const isSelected = selectedTag === tagKey;
              return (
                <button
                  type="button"
                  key={tagKey}
                  onClick={() => setSelectedTag(tagKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-primary-400 shadow-2xs`
                      : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  {TAG_ICONS[tagKey]}
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Content Area */}
        <div className="space-y-1">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={4}
            maxLength={3000}
            placeholder="Bạn đang gặp khó khăn ở bài tập nào, cần tìm bạn cùng học hay muốn chia sẻ tài liệu học tập? Viết chi tiết tại đây..."
            className="w-full px-4 py-3 text-sm bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all resize-none font-medium leading-relaxed"
          />
          <div className="flex justify-end">
            <span className="text-[11px] text-gray-400 font-medium">
              {postContent.length}/3000
            </span>
          </div>
        </div>

        {/* Professional Image Upload Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary-600" />
              <span>Ảnh đính kèm minh họa (Không bắt buộc)</span>
            </label>
            {!imageUrl && (
              <button
                type="button"
                onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                className="text-[11px] font-bold text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{isUrlInputOpen ? 'Đóng nhập link' : 'Dán link ảnh online'}</span>
              </button>
            )}
          </div>

          {/* URL Input Bar if toggled */}
          {isUrlInputOpen && !imageUrl && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlDraft.trim()}
                className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          )}

          {/* Upload Dropzone or Image Preview */}
          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 group aspect-[16/9] max-h-64 flex items-center justify-center shadow-xs">
              <img
                src={imageUrl}
                alt="Đính kèm"
                className="w-full h-full object-contain bg-black/5"
              />
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-white text-gray-900 text-xs font-bold rounded-xl shadow-md hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-primary-600" />
                  <span>Thay đổi ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-3.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                isDragOver
                  ? 'border-primary-500 bg-primary-50/50'
                  : 'border-gray-200 hover:border-primary-400 bg-gray-50/60 hover:bg-gray-50'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-7 h-7 text-primary-600 animate-spin" />
                  <span className="text-xs font-bold text-gray-700">Đang tải ảnh lên Cloudinary...</span>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 text-primary-600 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:text-primary-700 transition-all">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Kéo thả ảnh vào đây hoặc{' '}
                      <span className="text-primary-600 group-hover:underline">chọn từ thiết bị</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Hỗ trợ PNG, JPG, WEBP tối đa 5MB
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={handleFileChange}
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isPosting || isUploading}
          >
            Hủy
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isPosting}
            disabled={!isMember || !postContent.trim() || isUploading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Đăng bài viết
          </Button>
        </div>
      </form>
    </Modal>
  );
};
