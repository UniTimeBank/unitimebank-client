import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Share2,
  Heart,
  Send,
  Trash2,
  Plus,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  FolderDown,
  UserCheck,
  Smile,
  Image as ImageIcon,
  Check,
  Clock,
} from 'lucide-react';
import {
  useGetGroupByIdQuery,
  useGetGroupPostsQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useCreateGroupPostMutation,
  useToggleLikeGroupPostMutation,
  useDeleteGroupPostMutation,
  useGetGroupCommentsQuery,
  useCreateGroupCommentMutation,
  useDeleteGroupCommentMutation,
} from '@/core/api/community/communityApi';
import type { GroupPost, GroupPostTag } from '@/features/post/types';
import { toast } from 'react-hot-toast';

// Tag Config Helper
const TAG_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  QA: {
    label: 'Hỏi đáp bài tập',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
  },
  DOCUMENT: {
    label: 'Chia sẻ tài liệu',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <FolderDown className="w-3.5 h-3.5" />,
  },
  STUDY_BUDDY: {
    label: 'Tìm bạn cùng học',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: <Users className="w-3.5 h-3.5" />,
  },
  GENERAL: {
    label: 'Thảo luận chung',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
};

// Comment Item Sub-component
const PostCommentsSection: React.FC<{ groupId: string; postId: string; isMember?: boolean }> = ({
  groupId,
  postId,
  isMember,
}) => {
  const { data: comments = [], isLoading } = useGetGroupCommentsQuery({ groupId, postId });
  const [createComment, { isLoading: isSubmitting }] = useCreateGroupCommentMutation();
  const [deleteComment] = useDeleteGroupCommentMutation();
  const [content, setContent] = useState('');

  const currentUserId = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr)?.id || JSON.parse(userStr)?._id : '';
    } catch {
      return '';
    }
  })();

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment({
        groupId,
        postId,
        data: { content: content.trim() },
      }).unwrap();
      setContent('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể gửi bình luận. Vui lòng thử lại!');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      await deleteComment({ groupId, postId, commentId }).unwrap();
      toast.success('Đã xóa bình luận');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa bình luận');
    }
  };

  return (
    <div className="pt-4 mt-3 border-t border-gray-100 space-y-4">
      {/* List Comments */}
      {isLoading ? (
        <div className="py-2 text-center text-xs text-gray-400">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <div className="py-2 text-center text-xs text-gray-400">
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
                className="w-7 h-7 rounded-full object-cover border border-gray-200 mt-0.5"
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
                        onClick={() => handleDelete(comment._id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
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
          placeholder={isMember ? 'Viết câu trả lời hoặc thảo luận...' : 'Tham gia nhóm để bình luận...'}
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

// Post Item Sub-component
const PostItem: React.FC<{ post: GroupPost; groupId: string; isMember?: boolean }> = ({
  post,
  groupId,
  isMember,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeGroupPostMutation();
  const [deletePost] = useDeleteGroupPostMutation();

  const currentUserId = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr)?.id || JSON.parse(userStr)?._id : '';
    } catch {
      return '';
    }
  })();

  const isAuthor = currentUserId && post.authorId === currentUserId;
  const tagInfo = TAG_CONFIG[post.tag] || TAG_CONFIG.GENERAL;

  const handleLike = async () => {
    if (!isMember) {
      toast.error('Vui lòng tham gia nhóm để tương tác!');
      return;
    }
    try {
      await toggleLike({ groupId, postId: post._id }).unwrap();
    } catch (err: any) {
      toast.error('Không thể thực hiện tương tác');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await deletePost({ groupId, postId: post._id }).unwrap();
      toast.success('Đã xóa bài viết thành công');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa bài viết');
    }
  };

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
                {tagInfo.icon}
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
            onClick={handleDeletePost}
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

      {/* Action Bar (Like, Comment) */}
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-500">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
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
        <PostCommentsSection groupId={groupId} postId={post._id} isMember={isMember} />
      )}
    </div>
  );
};

export const GroupDetailPage: React.FC = () => {
  const { groupId = '' } = useParams<{ groupId: string }>();

  const { data: group, isLoading: isGroupLoading, error } = useGetGroupByIdQuery(groupId);
  const { data: posts = [], isLoading: isPostsLoading } = useGetGroupPostsQuery(groupId);

  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const [createPost, { isLoading: isPosting }] = useCreateGroupPostMutation();

  // Post Creator State
  const [postContent, setPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<GroupPostTag>('GENERAL');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('ALL');

  const handleToggleMembership = async () => {
    if (!group) return;
    try {
      if (group.isJoined) {
        await leaveGroup(group._id).unwrap();
        toast.success(`Đã rời khỏi ${group.name}`);
      } else {
        await joinGroup(group._id).unwrap();
        toast.success(`Chào mừng bạn tham gia ${group.name}! 🎉`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết!');
      return;
    }
    if (!group?.isJoined) {
      toast.error('Vui lòng tham gia nhóm trước khi đăng bài!');
      return;
    }

    try {
      const images = imageUrl.trim() ? [imageUrl.trim()] : [];
      await createPost({
        groupId,
        data: {
          content: postContent.trim(),
          tag: selectedTag,
          images,
        },
      }).unwrap();

      toast.success('Đăng bài thành công!');
      setPostContent('');
      setImageUrl('');
      setShowImageInput(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể đăng bài viết');
    }
  };

  if (isGroupLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-bold">Đang tải không gian nhóm...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Không tìm thấy nhóm học tập</h2>
        <p className="text-xs text-gray-500">
          Nhóm này có thể không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          to="/community"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Cộng đồng</span>
        </Link>
      </div>
    );
  }

  const filteredPosts = posts.filter((p) => {
    if (filterTag === 'ALL') return true;
    return p.tag === filterTag;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Back to Community Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/community"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Khám phá nhóm</span>
        </Link>
      </div>

      {/* Group Hero Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
          <img
            src={
              group.coverUrl ||
              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'
            }
            alt={group.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Group Header Info */}
        <div className="p-6 sm:p-8 relative -mt-12 sm:-mt-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white shadow-xs text-primary-700 text-xs font-black rounded-full border border-primary-100">
                {group.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                Nhóm công khai
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {group.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary-600" />
                <span>{group.membersCount.toLocaleString()} thành viên</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-sky-500" />
                <span>{group.postsCount || posts.length} bài viết</span>
              </span>
              <span>•</span>
              <span>Tạo bởi {group.creatorName}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Đã sao chép liên kết nhóm!');
              }}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors cursor-pointer"
              title="Chia sẻ nhóm"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleMembership}
              disabled={isJoining || isLeaving}
              className={`flex-1 md:flex-initial px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                group.isJoined
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600 border border-emerald-200'
                  : 'bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white shadow-primary-500/20'
              }`}
            >
              {group.isJoined ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã tham gia nhóm</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tham gia nhóm ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Post Creator + Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Creator Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Đăng thảo luận / Đặt câu hỏi cho nhóm</span>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={
                  group.isJoined
                    ? 'Bạn đang gặp khó khăn ở bài tập nào, hay muốn chia sẻ tài liệu gì?'
                    : 'Hãy tham gia nhóm để đăng bài và thảo luận cùng mọi người...'
                }
                disabled={!group.isJoined || isPosting}
                rows={3}
                className="w-full px-4 py-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all resize-none font-medium"
              />

              {showImageInput && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Dán đường dẫn ảnh minh họa (https://...)"
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
                  />
                </div>
              )}

              {/* Tag Selector & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(Object.keys(TAG_CONFIG) as GroupPostTag[]).map((tagKey) => {
                    const cfg = TAG_CONFIG[tagKey];
                    const isSelected = selectedTag === tagKey;
                    return (
                      <button
                        type="button"
                        key={tagKey}
                        onClick={() => setSelectedTag(tagKey)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                          isSelected
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-primary-400`
                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        {cfg.icon}
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    title="Đính kèm ảnh"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={!group.isJoined || !postContent.trim() || isPosting}
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

          {/* Filter Chips by Tag */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterTag('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterTag === 'ALL'
                  ? 'bg-gray-900 text-white shadow-2xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              Tất cả bài viết ({posts.length})
            </button>
            {(Object.keys(TAG_CONFIG) as GroupPostTag[]).map((tagKey) => {
              const cfg = TAG_CONFIG[tagKey];
              const isSelected = filterTag === tagKey;
              return (
                <button
                  key={tagKey}
                  onClick={() => setFilterTag(tagKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-2xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Posts List Feed */}
          {isPostsLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">Đang tải bảng tin...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Chưa có bài viết nào</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ tài liệu học tập vào nhóm!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostItem
                  key={post._id}
                  post={post}
                  groupId={groupId}
                  isMember={group.isJoined}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Group Sidebar */}
        <div className="space-y-6">
          {/* Giới thiệu nhóm */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span>Giới thiệu nhóm</span>
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {group.description}
            </p>

            <div className="pt-3 border-t border-gray-50 space-y-2 text-xs text-gray-500 font-medium">
              <div className="flex items-center justify-between">
                <span>Chuyên ngành:</span>
                <span className="font-bold text-gray-800">{group.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quyền riêng tư:</span>
                <span className="font-bold text-emerald-600">Công khai (Tất cả sinh viên)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quản trị viên:</span>
                <span className="font-bold text-gray-800">{group.creatorName}</span>
              </div>
            </div>
          </div>

          {/* Quy tắc nhóm */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Quy tắc cộng đồng</span>
            </h3>

            <div className="space-y-2.5">
              {(group.rules && group.rules.length > 0
                ? group.rules
                : [
                    'Tôn trọng và lịch sự với tất cả thành viên.',
                    'Chia sẻ kiến thức chính xác, không spam.',
                    'Hỗ trợ lẫn nhau cùng tiến bộ trong học tập.',
                  ]
              ).map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-600">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed font-medium">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
