import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  HelpCircle,
  FolderDown,
  Users,
  BookOpen,
} from 'lucide-react';
import type { GroupPost, GroupPostTag } from '@/features/post/types';
import { GROUP_POST_TAG_CONFIG } from '@/features/post/constants';
import { GroupPostComments } from './GroupPostComments';
import { toast } from 'react-hot-toast';

interface GroupPostItemProps {
  post: GroupPost;
  groupId: string;
  isMember?: boolean;
  onToggleLike: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  isLiking?: boolean;
}

const TAG_ICONS: Record<GroupPostTag, React.ReactNode> = {
  QA: <HelpCircle className="w-3.5 h-3.5" />,
  DOCUMENT: <FolderDown className="w-3.5 h-3.5" />,
  STUDY_BUDDY: <Users className="w-3.5 h-3.5" />,
  GENERAL: <BookOpen className="w-3.5 h-3.5" />,
};

export const GroupPostItem: React.FC<GroupPostItemProps> = ({
  post,
  groupId,
  isMember,
  onToggleLike,
  onDeletePost,
  isLiking,
}) => {
  const [showComments, setShowComments] = useState(false);

  const currentUserId = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr)?.id || JSON.parse(userStr)?._id : '';
    } catch {
      return '';
    }
  })();

  const isAuthor = currentUserId && post.authorId === currentUserId;
  const tagKey = (post.tag in GROUP_POST_TAG_CONFIG ? post.tag : 'GENERAL') as GroupPostTag;
  const tagInfo = GROUP_POST_TAG_CONFIG[tagKey];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs hover:shadow-md transition-all space-y-4">
      {/* Post Author Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={
              post.authorAvatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
            }
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900">{post.authorName}</h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${tagInfo.bg} ${tagInfo.text} ${tagInfo.border}`}
              >
                {TAG_ICONS[tagKey]}
                <span>{tagInfo.label}</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              {post.authorHeadline || 'Sinh viên UniTime'} •{' '}
              {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={() => onDeletePost(post._id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa bài viết"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-normal">
        {post.content}
      </div>

      {/* Post Images if any */}
      {post.images && post.images.length > 0 && (
        <div
          className={`grid gap-2 rounded-2xl overflow-hidden ${
            post.images.length === 1 ? 'grid-cols-1 max-h-96' : 'grid-cols-2 max-h-80'
          }`}
        >
          {post.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Post attachment"
              className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(img, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Action Bar (Like, Comment, Share) */}
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-500">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggleLike(post._id)}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              post.isLiked
                ? 'bg-rose-50 text-rose-600 font-black'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                post.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-400'
              }`}
            />
            <span>{post.likesCount} Thả tim</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span>{post.commentsCount} Thảo luận</span>
          </button>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Đã sao chép liên kết bài viết!');
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <GroupPostComments groupId={groupId} postId={post._id} isMember={isMember} />
      )}
    </div>
  );
};
