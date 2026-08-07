import {
  useGetMyRecurringSchedulesQuery,
  useCreateRecurringScheduleMutation,
  useUpdateRecurringScheduleMutation,
  useDeleteRecurringScheduleMutation,
  useGetMyScheduleExceptionsQuery,
  useCreateScheduleExceptionMutation,
  useDeleteScheduleExceptionMutation,
  useGetAvailabilityQuery,
} from '@/core/api/user/userApi';
import type { DayOfWeek, ExceptionType } from '../types';

export const useMentorSchedule = (
  mentorIdForAvailability?: string,
  availabilityParams?: { from: string; to: string },
) => {
  // Lịch lặp lại
  const {
    data: recurringData,
    isLoading: isRecurringLoading,
    refetch: refetchRecurring,
  } = useGetMyRecurringSchedulesQuery();

  const [createRecurring, { isLoading: isCreatingRecurring }] = useCreateRecurringScheduleMutation();
  const [updateRecurring, { isLoading: isUpdatingRecurring }] = useUpdateRecurringScheduleMutation();
  const [deleteRecurring, { isLoading: isDeletingRecurring }] = useDeleteRecurringScheduleMutation();

  // Lịch ngoại lệ (báo bận / thêm giờ)
  const {
    data: exceptionsData,
    isLoading: isExceptionsLoading,
    refetch: refetchExceptions,
  } = useGetMyScheduleExceptionsQuery();

  const [createException, { isLoading: isCreatingException }] = useCreateScheduleExceptionMutation();
  const [deleteException, { isLoading: isDeletingException }] = useDeleteScheduleExceptionMutation();

  // Khả dụng lịch rảnh
  const {
    data: availabilityData,
    isLoading: isAvailabilityLoading,
    refetch: refetchAvailability,
  } = useGetAvailabilityQuery(
    {
      mentorId: mentorIdForAvailability || '',
      userId: mentorIdForAvailability || '',
      from: availabilityParams?.from || '',
      to: availabilityParams?.to || '',
    },
    {
      skip: !mentorIdForAvailability || !availabilityParams?.from || !availabilityParams?.to,
    },
  );

  const handleCreateRecurring = async (dto: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => {
    return await createRecurring(dto).unwrap();
  };

  const handleUpdateRecurring = async (
    id: string,
    dto: { startTime?: string; endTime?: string; isActive?: boolean },
  ) => {
    return await updateRecurring({ scheduleId: id, data: dto }).unwrap();
  };

  const handleDeleteRecurring = async (id: string) => {
    return await deleteRecurring(id).unwrap();
  };

  const handleCreateException = async (dto: {
    exceptionDate: string;
    type: ExceptionType;
    startTime: string;
    endTime: string;
    reason?: string;
  }) => {
    return await createException(dto).unwrap();
  };

  const handleDeleteException = async (id: string) => {
    return await deleteException(id).unwrap();
  };

  return {
    recurringSchedules: recurringData?.data || [],
    isRecurringLoading,
    createRecurring: handleCreateRecurring,
    isCreatingRecurring,
    updateRecurring: handleUpdateRecurring,
    isUpdatingRecurring,
    deleteRecurring: handleDeleteRecurring,
    isDeletingRecurring,
    refetchRecurring,

    exceptions: exceptionsData?.data || [],
    isExceptionsLoading,
    createException: handleCreateException,
    isCreatingException,
    deleteException: handleDeleteException,
    isDeletingException,
    refetchExceptions,

    availability: availabilityData?.data || [],
    isAvailabilityLoading,
    refetchAvailability,
  };
};
