import { baseApi } from '@/core/api/baseApi';
import type {
  CommunityGroup,
  CreateCommunityGroupDto,
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
      providesTags: ['CommunityGroup'],
    }),

    // 2. Lấy chi tiết một nhóm
    getGroupById: builder.query<CommunityGroup, string>({
      query: (groupId) => `/groups/${groupId}`,
      providesTags: (_res, _err, id) => [{ type: 'CommunityGroup', id }],
    }),

    // 3. Tạo nhóm mới
    createGroup: builder.mutation<CommunityGroup, CreateCommunityGroupDto>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
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
      providesTags: ['GroupPost'],
    }),

    // 7. Đăng bài viết mới vào nhóm
    createGroupPost: builder.mutation<GroupPost, { groupId: string; data: CreateGroupPostDto }>({
      query: ({ groupId, data }) => ({
        url: `/groups/${groupId}/posts`,
        method: 'POST',
        body: data,
      }),
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
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useToggleLikeGroupPostMutation,
  useDeleteGroupPostMutation,
  useGetGroupCommentsQuery,
  useCreateGroupCommentMutation,
  useDeleteGroupCommentMutation,
} = communityApi;
