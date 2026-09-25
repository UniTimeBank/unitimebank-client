import { baseApi } from '@/core/api/baseApi';
import type {
  CommunityGroup,
  CreateCommunityGroupDto,
  GroupMember,
  GroupPost,
  CreateGroupPostDto,
  GroupComment,
  CreateGroupCommentDto,
} from '@/features/post/types';

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách nhóm
    getGroups: builder.query<
      CommunityGroup[],
      { search?: string; category?: string; myGroupsOnly?: boolean } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.search) q.append('search', params.search);
        if (params?.category && params.category !== 'Tất cả') q.append('category', params.category);
        if (params?.myGroupsOnly) q.append('myGroupsOnly', 'true');
        const str = q.toString();
        return `/groups${str ? `?${str}` : ''}`;
      },
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as CommunityGroup[];
        const res = response as { groups?: CommunityGroup[]; data?: { groups?: CommunityGroup[] } | CommunityGroup[] };
        if (Array.isArray(res?.groups)) return res.groups;
        if (Array.isArray((res?.data as { groups?: CommunityGroup[] })?.groups)) return (res.data as { groups: CommunityGroup[] }).groups;
        if (Array.isArray(res?.data)) return res.data as CommunityGroup[];
        return [];
      },
      providesTags: ['CommunityGroup'],
    }),

    // 2. Lấy chi tiết một nhóm
    getGroupById: builder.query<CommunityGroup, string>({
      query: (groupId) => `/groups/${groupId}`,
      transformResponse: (response: unknown) => {
        const res = response as { data?: CommunityGroup } | CommunityGroup;
        return (res as { data?: CommunityGroup })?.data || (res as CommunityGroup);
      },
      providesTags: (_res, _err, id) => [{ type: 'CommunityGroup', id }],
    }),

    // 3. Tạo nhóm mới
    createGroup: builder.mutation<CommunityGroup, CreateCommunityGroupDto>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const res = response as { data?: CommunityGroup } | CommunityGroup;
        return (res as { data?: CommunityGroup })?.data || (res as CommunityGroup);
      },
      invalidatesTags: ['CommunityGroup'],
    }),

    // 4. Tham gia nhóm
    joinGroup: builder.mutation<{ message: string }, string>({
      query: (groupId) => ({
        url: `/groups/${groupId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'CommunityGroup', id }, 'CommunityGroup'],
    }),

    // 5. Rời nhóm
    leaveGroup: builder.mutation<{ message: string }, string>({
      query: (groupId) => ({
        url: `/groups/${groupId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [{ type: 'CommunityGroup', id }, 'CommunityGroup'],
    }),

    // 6. Lấy danh sách bài viết trong nhóm
    getGroupPosts: builder.query<GroupPost[], string>({
      query: (groupId) => `/groups/${groupId}/posts`,
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as GroupPost[];
        const res = response as { posts?: GroupPost[]; data?: { posts?: GroupPost[] } | GroupPost[] };
        if (Array.isArray(res?.posts)) return res.posts;
        if (Array.isArray((res?.data as { posts?: GroupPost[] })?.posts)) return (res.data as { posts: GroupPost[] }).posts;
        if (Array.isArray(res?.data)) return res.data as GroupPost[];
        return [];
      },
      providesTags: ['GroupPost'],
    }),

    // 7. Đăng bài viết mới vào nhóm
    createGroupPost: builder.mutation<GroupPost, { groupId: string; data: CreateGroupPostDto }>({
      query: ({ groupId, data }) => ({
        url: `/groups/${groupId}/posts`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: unknown) => {
        const res = response as { data?: GroupPost } | GroupPost;
        return (res as { data?: GroupPost })?.data || (res as GroupPost);
      },
      invalidatesTags: ['GroupPost', 'CommunityGroup'],
    }),

    // 8. Thả tim / Bỏ tim bài viết
    toggleLikeGroupPost: builder.mutation<
      { isLiked: boolean; likesCount: number },
      { groupId: string; postId: string }
    >({
      query: ({ groupId, postId }) => ({
        url: `/groups/${groupId}/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['GroupPost'],
    }),

    // 9. Xóa bài viết trong nhóm
    deleteGroupPost: builder.mutation<void, { groupId: string; postId: string }>({
      query: ({ groupId, postId }) => ({
        url: `/groups/${groupId}/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GroupPost', 'CommunityGroup'],
    }),

    // 10. Lấy danh sách bình luận
    getGroupComments: builder.query<GroupComment[], { groupId: string; postId: string }>({
      query: ({ groupId, postId }) => `/groups/${groupId}/posts/${postId}/comments`,
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as GroupComment[];
        const res = response as { comments?: GroupComment[]; data?: { comments?: GroupComment[] } | GroupComment[] };
        if (Array.isArray(res?.comments)) return res.comments;
        if (Array.isArray((res?.data as { comments?: GroupComment[] })?.comments)) return (res.data as { comments: GroupComment[] }).comments;
        if (Array.isArray(res?.data)) return res.data as GroupComment[];
        return [];
      },
      providesTags: ['GroupComment'],
    }),

    // 11. Thêm bình luận
    createGroupComment: builder.mutation<
      GroupComment,
      { groupId: string; postId: string; data: CreateGroupCommentDto }
    >({
      query: ({ groupId, postId, data }) => ({
        url: `/groups/${groupId}/posts/${postId}/comments`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: unknown) => {
        const res = response as { data?: GroupComment } | GroupComment;
        return (res as { data?: GroupComment })?.data || (res as GroupComment);
      },
      invalidatesTags: ['GroupComment', 'GroupPost'],
    }),

    // 12. Xóa bình luận
    deleteGroupComment: builder.mutation<
      void,
      { groupId: string; postId: string; commentId: string }
    >({
      query: ({ groupId, postId, commentId }) => ({
        url: `/groups/${groupId}/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GroupComment', 'GroupPost'],
    }),

    // 13. Giải tán nhóm (Chỉ Trưởng nhóm)
    deleteGroup: builder.mutation<{ message: string }, string>({
      query: (groupId) => ({
        url: `/groups/${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CommunityGroup'],
    }),

    // 14. Chuyển quyền trưởng nhóm (Chỉ Trưởng nhóm)
    transferGroupOwnership: builder.mutation<
      CommunityGroup,
      { groupId: string; newOwnerId: string }
    >({
      query: ({ groupId, newOwnerId }) => ({
        url: `/groups/${groupId}/transfer-ownership`,
        method: 'POST',
        body: { newOwnerId },
      }),
      transformResponse: (response: unknown) => {
        const res = response as { data?: CommunityGroup } | CommunityGroup;
        return (res as { data?: CommunityGroup })?.data || (res as CommunityGroup);
      },
      invalidatesTags: (_res, _err, { groupId }) => [{ type: 'CommunityGroup', id: groupId }, 'CommunityGroup'],
    }),

    // 15. Lấy danh sách thành viên nhóm
    getGroupMembers: builder.query<GroupMember[], string>({
      query: (groupId) => `/groups/${groupId}/members`,
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as GroupMember[];
        const res = response as { data?: GroupMember[] };
        if (Array.isArray(res?.data)) return res.data;
        return [];
      },
      providesTags: (_res, _err, id) => [{ type: 'CommunityGroup', id }],
    }),

    // 16. Đuổi thành viên khỏi nhóm (Chỉ Trưởng nhóm)
    kickGroupMember: builder.mutation<
      CommunityGroup,
      { groupId: string; targetUserId: string }
    >({
      query: ({ groupId, targetUserId }) => ({
        url: `/groups/${groupId}/members/${targetUserId}/kick`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => {
        const res = response as { data?: CommunityGroup } | CommunityGroup;
        return (res as { data?: CommunityGroup })?.data || (res as CommunityGroup);
      },
      invalidatesTags: (_res, _err, { groupId }) => [{ type: 'CommunityGroup', id: groupId }],
    }),

    // 17. Cấm thành viên tham gia nhóm (Chỉ Trưởng nhóm)
    banGroupMember: builder.mutation<
      CommunityGroup,
      { groupId: string; targetUserId: string }
    >({
      query: ({ groupId, targetUserId }) => ({
        url: `/groups/${groupId}/members/${targetUserId}/ban`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => {
        const res = response as { data?: CommunityGroup } | CommunityGroup;
        return (res as { data?: CommunityGroup })?.data || (res as CommunityGroup);
      },
      invalidatesTags: (_res, _err, { groupId }) => [{ type: 'CommunityGroup', id: groupId }],
    }),

    // 18. Bỏ cấm thành viên trong nhóm (Chỉ Trưởng nhóm)
    unbanGroupMember: builder.mutation<
      CommunityGroup,
      { groupId: string; targetUserId: string }
    >({
      query: ({ groupId, targetUserId }) => ({
        url: `/groups/${groupId}/members/${targetUserId}/unban`,
        method: 'POST',
      }),
      transformResponse: (response: unknown) => {
        const res = response as { data?: CommunityGroup } | CommunityGroup;
        return (res as { data?: CommunityGroup })?.data || (res as CommunityGroup);
      },
      invalidatesTags: (_res, _err, { groupId }) => [{ type: 'CommunityGroup', id: groupId }],
    }),

    // 19. Lấy danh sách thành viên bị cấm (Chỉ Trưởng nhóm)
    getBannedGroupMembers: builder.query<
      { id: string; name: string; avatar: string; email?: string }[],
      string
    >({
      query: (groupId) => `/groups/${groupId}/banned-members`,
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response as { id: string; name: string; avatar: string; email?: string }[];
        const res = response as { data?: { id: string; name: string; avatar: string; email?: string }[] };
        if (Array.isArray(res?.data)) return res.data;
        return [];
      },
      providesTags: (_res, _err, id) => [{ type: 'CommunityGroup', id }],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useDeleteGroupMutation,
  useTransferGroupOwnershipMutation,
  useGetGroupMembersQuery,
  useKickGroupMemberMutation,
  useBanGroupMemberMutation,
  useUnbanGroupMemberMutation,
  useGetBannedGroupMembersQuery,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useToggleLikeGroupPostMutation,
  useDeleteGroupPostMutation,
  useGetGroupCommentsQuery,
  useCreateGroupCommentMutation,
  useDeleteGroupCommentMutation,
} = communityApi;
