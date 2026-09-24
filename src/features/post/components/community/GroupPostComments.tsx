import React from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useGroupComments } from '@/features/post/hooks/useGroupComments';

interface GroupPostCommentsProps {
  groupId: string;
  postId: string;
  isMember?: boolean;
}

export const GroupPostComments: React.FC<GroupPostCommentsProps> = ({
  groupId,
  postId,
  isMember,
}) => {
  const {
    comments,
    isLoading,
    isSubmitting,
    content,
    setContent,
    currentUserId,
    handleSendComment,
    handleDeleteComment,
  } = useGroupComments(groupId, postId, isMember);

  return (
    <div className="pt-4 mt-3 border-t border-gray-100 space-y-4 animate-fadeIn">
      {/* List Comments */}
      {isLoading ? (
        <div className="py-2 text-center text-xs text-gray-400 font-medium">
          Đang tải bình luận...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-2 text-center text-xs text-gray-400 font-medium">
          Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-2.5 group">
              <img
                src={
                  comment.authorAvatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                }
                alt={comment.authorName}
                className="w-7 h-7 rounded-full object-cover border border-gray-200 mt-0.5 shrink-0"
              />
              <div className="flex-1 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{comment.authorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {currentUserId && comment.authorId === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed font-medium">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input box */}
      <form onSubmit={handleSendComment} className="flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isMember
              ? 'Viết câu trả lời hoặc thảo luận...'
              : 'Tham gia nhóm để bình luận...'
          }
          disabled={!isMember || isSubmitting}
          className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium transition-all"
        />
        <button
          type="submit"
          disabled={!isMember || !content.trim() || isSubmitting}
          className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
