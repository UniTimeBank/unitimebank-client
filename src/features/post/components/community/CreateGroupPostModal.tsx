import React, { useRef } from 'react';
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
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { useGetMeQuery } from '@/core/api/user';

interface CreateGroupPostModalProps {
  form: ReturnType<typeof useCreateGroupPostForm>;
  groupName: string;
  isMember?: boolean;
}

const TAG_ICONS: Record<GroupPostTag, React.ReactNode> = {
  QA: <HelpCircle className="w-3.5 h-3.5 shrink-0" />,
  DOCUMENT: <FolderDown className="w-3.5 h-3.5 shrink-0" />,
  STUDY_BUDDY: <Users className="w-3.5 h-3.5 shrink-0" />,
  GENERAL: <BookOpen className="w-3.5 h-3.5 shrink-0" />,
};

export const CreateGroupPostModal: React.FC<CreateGroupPostModalProps> = ({
  form,
  groupName,
  isMember,
}) => {
  const authUser = useAppSelector(selectCurrentUser);
  const { data: userProfile } = useGetMeQuery(undefined, { skip: !authUser });
  const displayName = userProfile?.displayName || authUser?.email?.split('@')[0] || 'Bạn';
  const avatarUrl = userProfile?.avatarUrl;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    isUploading,
    isPosting,
    handleProcessFile,
    handleApplyUrl,
    handleSubmit,
  } = form;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Tạo bài viết trong nhóm"
      description={`Đăng vào nhóm "${groupName}"`}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* User Profile Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
              {displayName.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Thành viên nhóm
            </p>
          </div>
        </div>

        {/* Tag / Topic Selector Section - Full Width 4-Column Row */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 block">
            Chủ đề bài viết <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {(Object.keys(GROUP_POST_TAG_CONFIG) as GroupPostTag[]).map((tagKey) => {
              const cfg = GROUP_POST_TAG_CONFIG[tagKey];
              const isSelected = selectedTag === tagKey;
              return (
                <button
                  type="button"
                  key={tagKey}
                  onClick={() => setSelectedTag(tagKey)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2 border text-center whitespace-nowrap ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600 font-bold shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
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
            placeholder={`Chia sẻ kiến thức, tài liệu hoặc đặt câu hỏi cùng nhóm "${groupName}"...`}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white border border-gray-200 focus:border-primary-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 transition-all resize-none font-normal leading-relaxed placeholder:text-gray-400 text-gray-900"
          />
        </div>

        {/* Image Attachment Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
              <span>Ảnh đính kèm</span>
            </span>
            {!imageUrl && (
              <button
                type="button"
                onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{isUrlInputOpen ? 'Đóng nhập link' : 'Dán link ảnh'}</span>
              </button>
            )}
          </div>

          {/* URL Input Bar if toggled */}
          {isUrlInputOpen && !imageUrl && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlDraft.trim()}
                className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          )}

          {/* Upload Dropzone or Image Preview */}
          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 group aspect-[16/9] max-h-60 flex items-center justify-center shadow-2xs border border-gray-200">
              {/* Blurred Ambient Background */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-40 scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />

              {/* Crisp Foreground Image (Contain) */}
              <img
                src={imageUrl}
                alt="Đính kèm"
                className="relative z-10 w-full h-full object-contain"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Đổi ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
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
              className={`border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                isDragOver
                  ? 'border-primary-500 bg-primary-50/50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                  <span className="text-xs font-medium text-gray-600">Đang tải ảnh lên...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <p className="text-xs text-gray-600">
                    Kéo thả ảnh vào đây hoặc{' '}
                    <span className="text-primary-600 font-semibold hover:underline">chọn ảnh</span>
                  </p>
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
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
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
