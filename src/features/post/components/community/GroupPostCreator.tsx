import React from 'react';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  HelpCircle,
  FolderDown,
  Users,
  BookOpen,
} from 'lucide-react';
import type { GroupPostTag } from '@/features/post/types';
import { GROUP_POST_TAG_CONFIG } from '@/features/post/constants';

interface GroupPostCreatorProps {
  isMember?: boolean;
  postContent: string;
  onPostContentChange: (val: string) => void;
  selectedTag: GroupPostTag;
  onTagSelect: (tag: GroupPostTag) => void;
  imageUrl: string;
  onImageUrlChange: (val: string) => void;
  showImageInput: boolean;
  onToggleImageInput: () => void;
  isPosting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const TAG_ICONS: Record<GroupPostTag, React.ReactNode> = {
  QA: <HelpCircle className="w-3.5 h-3.5" />,
  DOCUMENT: <FolderDown className="w-3.5 h-3.5" />,
  STUDY_BUDDY: <Users className="w-3.5 h-3.5" />,
  GENERAL: <BookOpen className="w-3.5 h-3.5" />,
};

export const GroupPostCreator: React.FC<GroupPostCreatorProps> = ({
  isMember,
  postContent,
  onPostContentChange,
  selectedTag,
  onTagSelect,
  imageUrl,
  onImageUrlChange,
  showImageInput,
  onToggleImageInput,
  isPosting,
  onSubmit,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
        <Sparkles className="w-4 h-4 text-primary-500" />
        <span>Đăng thảo luận / Đặt câu hỏi cho nhóm</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={postContent}
          onChange={(e) => onPostContentChange(e.target.value)}
          placeholder={
            isMember
              ? 'Bạn đang gặp khó khăn ở bài tập nào, hay muốn chia sẻ tài liệu gì?'
              : 'Hãy tham gia nhóm để đăng bài và thảo luận cùng mọi người...'
          }
          disabled={!isMember || isPosting}
          rows={3}
          className="w-full px-4 py-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all resize-none font-medium"
        />

        {showImageInput && (
          <div className="flex items-center gap-2 animate-fadeIn">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              placeholder="Dán đường dẫn ảnh minh họa (https://...)"
              className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
            />
          </div>
        )}

        {/* Tag Selector & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(GROUP_POST_TAG_CONFIG) as GroupPostTag[]).map((tagKey) => {
              const cfg = GROUP_POST_TAG_CONFIG[tagKey];
              const isSelected = selectedTag === tagKey;
              return (
                <button
                  type="button"
                  key={tagKey}
                  onClick={() => onTagSelect(tagKey)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-primary-400`
                      : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  {TAG_ICONS[tagKey]}
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleImageInput}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Đính kèm ảnh"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!isMember || !postContent.trim() || isPosting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {isPosting ? (
                <span>Đang đăng...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Đăng bài</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
