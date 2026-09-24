import React, { useRef, useEffect } from 'react';
import { Send, Trash2, Reply } from 'lucide-react';
import { useGroupComments } from '@/features/post/hooks/useGroupComments';
import { formatGroupPostDate } from '@/shared/utils';

interface GroupPostCommentsProps {
  groupId: string;
  postId: string;
  isMember?: boolean;
  isGroupOwner?: boolean;
}

export const GroupPostComments: React.FC<GroupPostCommentsProps> = ({
  groupId,
  postId,
  isMember,
  isGroupOwner,
}) => {
  const {
    rootComments,
    repliesMap,
    isLoading,
    isSubmitting,
    content,
    setContent,
    replyingTo,
    handleStartReply,
    handleCancelReply,
    currentUserId,
    handleSendComment,
    handleDeleteComment,
  } = useGroupComments(groupId, postId, isMember);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when user clicks Reply
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  return (
    <div className="pt-4 mt-3 border-t border-gray-100 space-y-4 animate-fadeIn">
      {/* List Comments - 2 Level Tree */}
      {isLoading ? (
        <div className="py-2 text-center text-xs text-gray-400 font-medium">
          Đang tải bình luận...
        </div>
      ) : rootComments.length === 0 ? (
        <div className="py-2 text-center text-xs text-gray-400 font-medium">
          Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map((rootComment) => {
            const isRootAuthor = Boolean(currentUserId && rootComment.authorId === currentUserId);
            const canDeleteRoot = Boolean(isRootAuthor || isGroupOwner);
            const replies = repliesMap[rootComment._id] || [];

            return (
              <div key={rootComment._id} className="space-y-2">
                {/* Level 1: Root Comment */}
                <div className="flex items-start gap-2.5 group">
                  <img
                    src={
                      rootComment.authorAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                    }
                    alt={rootComment.authorName}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 mt-0.5 shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50/90 hover:bg-gray-50 p-3 rounded-2xl border border-gray-100/90 transition-colors">
                      <h5 className="text-xs font-bold text-gray-900 leading-none truncate">
                        {rootComment.authorName}
                      </h5>
                      <p className="text-xs text-gray-800 mt-1.5 leading-relaxed font-normal whitespace-pre-line break-words">
                        {rootComment.content}
                      </p>
                    </div>

                    {/* Action row under Level 1 comment */}
                    <div className="flex items-center gap-3 mt-1 px-1 text-[11px] font-medium text-gray-400">
                      <span>{formatGroupPostDate(rootComment.createdAt)}</span>

                      {isMember && (
                        <button
                          type="button"
                          onClick={() => handleStartReply(rootComment)}
                          className="font-bold text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Reply className="w-3 h-3" />
                          <span>Trả lời</span>
                        </button>
                      )}

                      {canDeleteRoot && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(rootComment._id)}
                          className="text-gray-400 hover:text-red-500 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                          title={isGroupOwner && !isRootAuthor ? 'Xóa (Quyền Trưởng nhóm)' : 'Xóa bình luận'}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Level 2: Replies (Indented by exactly 1 level, fixed 2-level depth) */}
                {replies.length > 0 && (
                  <div className="pl-6 sm:pl-8 space-y-2 border-l-2 border-gray-100 ml-4 sm:ml-4 pt-1">
                    {replies.map((reply) => {
                      const isReplyAuthor = Boolean(currentUserId && reply.authorId === currentUserId);
                      const canDeleteReply = Boolean(isReplyAuthor || isGroupOwner);

                      return (
                        <div key={reply._id} className="flex items-start gap-2.5 group">
                          <img
                            src={
                              reply.authorAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                            }
                            alt={reply.authorName}
                            className="w-7 h-7 rounded-full object-cover border border-gray-200 mt-0.5 shrink-0 shadow-2xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50/70 hover:bg-gray-50 p-2.5 rounded-2xl border border-gray-100/80 transition-colors">
                              <h6 className="text-xs font-bold text-gray-900 leading-none truncate">
                                {reply.authorName}
                              </h6>
                              <p className="text-xs text-gray-800 mt-1 leading-relaxed font-normal whitespace-pre-line break-words">
                                {reply.replyToUserName && (
                                  <span className="font-bold text-primary-600 mr-1.5">
                                    @{reply.replyToUserName}
                                  </span>
                                )}
                                {reply.content}
                              </p>
                            </div>

                            {/* Action row under Level 2 comment */}
                            <div className="flex items-center gap-3 mt-1 px-1 text-[11px] font-medium text-gray-400">
                              <span>{formatGroupPostDate(reply.createdAt)}</span>

                              {isMember && (
                                <button
                                  type="button"
                                  onClick={() => handleStartReply(reply)}
                                  className="font-bold text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Reply className="w-3 h-3" />
                                  <span>Trả lời</span>
                                </button>
                              )}

                              {canDeleteReply && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(reply._id)}
                                  className="text-gray-400 hover:text-red-500 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                                  title={isGroupOwner && !isReplyAuthor ? 'Xóa (Quyền Trưởng nhóm)' : 'Xóa bình luận'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Input box */}
      <div className="space-y-1.5 pt-1">
        {/* Reply Indicator */}
        {replyingTo && (
          <div className="flex items-center justify-between text-xs text-gray-500 px-1 py-0.5 animate-fadeIn">
            <span className="truncate">
              Đang trả lời <span className="font-semibold text-gray-700">@{replyingTo.authorName}</span>
            </span>
            <button
              type="button"
              onClick={handleCancelReply}
              className="text-xs text-gray-400 hover:text-gray-700 font-medium hover:underline cursor-pointer shrink-0 ml-2"
            >
              Hủy
            </button>
          </div>
        )}

        <form onSubmit={handleSendComment} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isMember
                ? replyingTo
                  ? `Trả lời @${replyingTo.authorName}...`
                  : 'Viết câu trả lời hoặc thảo luận...'
                : 'Tham gia nhóm để bình luận...'
            }
            disabled={!isMember || isSubmitting}
            className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!isMember || !content.trim() || isSubmitting}
            className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
