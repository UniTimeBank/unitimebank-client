import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/shared/hooks';
import { communityApi } from '@/core/api/community/communityApi';
import { getCommunitySocket } from '../utils/communitySocket';
import type { GroupPost, GroupComment } from '../types';
import { toast } from 'react-hot-toast';

export const useCommunityRealtime = (
  groupId?: string,
  _isJoined?: boolean,
  currentUserId?: string,
) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!groupId) return;

    const socket = getCommunitySocket();
    if (!socket) return;

    // Join the group room
    socket.emit('group:join', { groupId });

    // 1. Post Created Realtime
    const handlePostCreated = (post: GroupPost) => {
      if (post && post.groupId === groupId) {
        dispatch(
          communityApi.util.updateQueryData('getGroupPosts', groupId, (draft) => {
            if (!draft.some((p) => p._id === post._id)) {
              draft.unshift(post);
            }
          }),
        );
        dispatch(
          communityApi.util.updateQueryData('getGroupById', groupId, (draft) => {
            if (draft) {
              draft.postsCount = (draft.postsCount || 0) + 1;
            }
          }),
        );
      }
    };

    // 2. Post Deleted Realtime
    const handlePostDeleted = (payload: { postId: string; groupId: string }) => {
      if (payload && payload.groupId === groupId) {
        dispatch(
          communityApi.util.updateQueryData('getGroupPosts', groupId, (draft) => {
            return draft.filter((p) => p._id !== payload.postId);
          }),
        );
        dispatch(
          communityApi.util.updateQueryData('getGroupById', groupId, (draft) => {
            if (draft && draft.postsCount > 0) {
              draft.postsCount = Math.max(0, draft.postsCount - 1);
            }
          }),
        );
      }
    };

    // 3. Post Liked Realtime
    const handlePostLiked = (payload: {
      postId: string;
      groupId: string;
      userId: string;
      isLiked: boolean;
      likesCount: number;
    }) => {
      if (payload && payload.groupId === groupId) {
        dispatch(
          communityApi.util.updateQueryData('getGroupPosts', groupId, (draft) => {
            const target = draft.find((p) => p._id === payload.postId);
            if (target) {
              target.likesCount = payload.likesCount;
              if (currentUserId && payload.userId === currentUserId) {
                target.isLiked = payload.isLiked;
              }
            }
          }),
        );
      }
    };

    // 4. Comment Created Realtime
    const handleCommentCreated = (payload: {
      comment: GroupComment;
      postId: string;
      groupId: string;
    }) => {
      if (payload && payload.groupId === groupId) {
        dispatch(
          communityApi.util.updateQueryData(
            'getGroupComments',
            { groupId, postId: payload.postId },
            (draft) => {
              if (!draft.some((c) => c._id === payload.comment._id)) {
                draft.push(payload.comment);
              }
            },
          ),
        );
        dispatch(
          communityApi.util.updateQueryData('getGroupPosts', groupId, (draft) => {
            const target = draft.find((p) => p._id === payload.postId);
            if (target) {
              target.commentsCount = (target.commentsCount || 0) + 1;
            }
          }),
        );
      }
    };

    // 5. Comment Deleted Realtime
    const handleCommentDeleted = (payload: {
      commentId: string;
      postId: string;
      groupId: string;
    }) => {
      if (payload && payload.groupId === groupId) {
        dispatch(
          communityApi.util.updateQueryData(
            'getGroupComments',
            { groupId, postId: payload.postId },
            (draft) => {
              return draft.filter((c) => c._id !== payload.commentId && c.parentId !== payload.commentId);
            },
          ),
        );
        dispatch(
          communityApi.util.updateQueryData('getGroupPosts', groupId, (draft) => {
            const target = draft.find((p) => p._id === payload.postId);
            if (target && target.commentsCount > 0) {
              target.commentsCount = Math.max(0, target.commentsCount - 1);
            }
          }),
        );
      }
    };

    // 6. Member Kicked Realtime
    const handleMemberKicked = (payload: { groupId: string; userId: string }) => {
      if (payload && payload.groupId === groupId) {
        if (currentUserId && payload.userId === currentUserId) {
          toast.error('Bạn đã bị Trưởng nhóm đuổi khỏi nhóm học tập.');
          dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
        } else {
          dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
        }
      }
    };

    // 7. Member Banned Realtime
    const handleMemberBanned = (payload: { groupId: string; userId: string }) => {
      if (payload && payload.groupId === groupId) {
        if (currentUserId && payload.userId === currentUserId) {
          toast.error('Bạn đã bị cấm khỏi nhóm học tập này.');
          dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
          navigate('/community', { replace: true });
        } else {
          dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
        }
      }
    };

    // 8. Member Unbanned Realtime
    const handleMemberUnbanned = (payload: { groupId: string; userId: string }) => {
      if (payload && payload.groupId === groupId) {
        dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
      }
    };

    // 9. Ownership Transferred Realtime
    const handleOwnershipTransferred = (payload: {
      groupId: string;
      newOwnerId: string;
      previousOwnerId?: string;
    }) => {
      if (payload && payload.groupId === groupId) {
        if (currentUserId && payload.newOwnerId === currentUserId) {
          toast.success('Bạn đã được chuyển quyền làm Trưởng nhóm mới! 👑');
        }
        dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
      }
    };

    // 10. Group Disbanded Realtime
    const handleGroupDisbanded = (payload: { groupId: string }) => {
      if (payload && payload.groupId === groupId) {
        toast.error('Nhóm học tập này đã được giải tán bởi Trưởng nhóm.');
        dispatch(communityApi.util.invalidateTags(['CommunityGroup']));
        navigate('/community', { replace: true });
      }
    };

    // Direct User Notifications from Server
    const handleUserKicked = (payload: { groupId: string }) => {
      if (payload?.groupId === groupId) {
        toast.error('Bạn đã bị Trưởng nhóm xóa khỏi nhóm học tập.');
        dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
      }
    };

    const handleUserBanned = (payload: { groupId: string }) => {
      if (payload?.groupId === groupId) {
        toast.error('Bạn đã bị cấm truy cập vào nhóm này.');
        dispatch(communityApi.util.invalidateTags([{ type: 'CommunityGroup', id: groupId }]));
        navigate('/community', { replace: true });
      }
    };

    // Bind listeners
    socket.on('group:post_created', handlePostCreated);
    socket.on('group:post_deleted', handlePostDeleted);
    socket.on('group:post_liked', handlePostLiked);
    socket.on('group:comment_created', handleCommentCreated);
    socket.on('group:comment_deleted', handleCommentDeleted);
    socket.on('group:member_kicked', handleMemberKicked);
    socket.on('group:member_banned', handleMemberBanned);
    socket.on('group:member_unbanned', handleMemberUnbanned);
    socket.on('group:ownership_transferred', handleOwnershipTransferred);
    socket.on('group:disbanded', handleGroupDisbanded);
    socket.on('group:you_were_kicked', handleUserKicked);
    socket.on('group:you_were_banned', handleUserBanned);

    return () => {
      socket.emit('group:leave', { groupId });
      socket.off('group:post_created', handlePostCreated);
      socket.off('group:post_deleted', handlePostDeleted);
      socket.off('group:post_liked', handlePostLiked);
      socket.off('group:comment_created', handleCommentCreated);
      socket.off('group:comment_deleted', handleCommentDeleted);
      socket.off('group:member_kicked', handleMemberKicked);
      socket.off('group:member_banned', handleMemberBanned);
      socket.off('group:member_unbanned', handleMemberUnbanned);
      socket.off('group:ownership_transferred', handleOwnershipTransferred);
      socket.off('group:disbanded', handleGroupDisbanded);
      socket.off('group:you_were_kicked', handleUserKicked);
      socket.off('group:you_were_banned', handleUserBanned);
    };
  }, [groupId, currentUserId, dispatch, navigate]);
};
