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
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.groups)) return response.groups;
        if (Array.isArray(response?.data?.groups)) return response.data.groups;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ['CommunityGroup'],
    }),

    // 2. Lấy chi tiết một nhóm
    getGroupById: builder.query<CommunityGroup, string>({
      query: (groupId) => `/groups/${groupId}`,
      transformResponse: (response: any) => {
        return response?.data || response;
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
      transformResponse: (response: any) => {
        return response?.data || response;
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
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.posts)) return response.posts;
        if (Array.isArray(response?.data?.posts)) return response.data.posts;
        if (Array.isArray(response?.data)) return response.data;
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
      transformResponse: (response: any) => {
        return response?.data || response;
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
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.comments)) return response.comments;
        if (Array.isArray(response?.data?.comments)) return response.data.comments;
        if (Array.isArray(response?.data)) return response.data;
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
      transformResponse: (response: any) => {
        return response?.data || response;
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
      transformResponse: (response: any) => {
        return response?.data || response;
      },
      invalidatesTags: (_res, _err, { groupId }) => [{ type: 'CommunityGroup', id: groupId }, 'CommunityGroup'],
    }),

    // 15. Lấy danh sách thành viên nhóm
    getGroupMembers: builder.query<GroupMember[], string>({
      query: (groupId) => `/groups/${groupId}/members`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
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
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useToggleLikeGroupPostMutation,
  useDeleteGroupPostMutation,
  useGetGroupCommentsQuery,
  useCreateGroupCommentMutation,
  useDeleteGroupCommentMutation,
} = communityApi;
