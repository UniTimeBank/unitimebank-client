import { useGetGroupByIdQuery, useJoinGroupMutation, useLeaveGroupMutation } from '@/core/api/community/communityApi';
import { toast } from 'react-hot-toast';

export const useGroupDetail = (groupId: string) => {
  const { data: group, isLoading, isFetching, error, refetch } = useGetGroupByIdQuery(groupId, {
    skip: !groupId,
  });

  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

  const handleToggleMembership = async () => {
    if (!group) return;
    try {
      if (group.isJoined) {
        await leaveGroup(group._id).unwrap();
        toast.success(`Đã rời khỏi nhóm ${group.name}`);
      } else {
        await joinGroup(group._id).unwrap();
        toast.success(`Chào mừng bạn tham gia ${group.name}! 🎉`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!');
    }
  };

  const handleShareGroup = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết nhóm vào clipboard!');
  };

  return {
    group,
    isLoading,
    isFetching,
    error,
    isMembershipProcessing: isJoining || isLeaving,
    handleToggleMembership,
    handleShareGroup,
    refetch,
  };
};
