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
import type {
  CreateRecurringScheduleDto,
  UpdateRecurringScheduleDto,
  CreateScheduleExceptionDto,
} from '../types';

export const useMentorSchedule = (
  mentorId?: string,
  availabilityRange?: { from: string; to: string },
) => {
  // 1. Lịch lặp lại hàng tuần của tôi
  const { data: recurringData, isLoading: isRecurringLoading } = useGetMyRecurringSchedulesQuery();
  const [createRecurringMutation, { isLoading: isCreatingRecurring }] = useCreateRecurringScheduleMutation();
  const [updateRecurringMutation, { isLoading: isUpdatingRecurring }] = useUpdateRecurringScheduleMutation();
  const [deleteRecurringMutation, { isLoading: isDeletingRecurring }] = useDeleteRecurringScheduleMutation();

  // 2. Lịch ngoại lệ của tôi
  const { data: exceptionsData, isLoading: isExceptionsLoading } = useGetMyScheduleExceptionsQuery();
  const [createExceptionMutation, { isLoading: isCreatingException }] = useCreateScheduleExceptionMutation();
  const [deleteExceptionMutation, { isLoading: isDeletingException }] = useDeleteScheduleExceptionMutation();

  // 3. Khả dụng lịch rảnh (dành cho người học xem lịch mentor)
  const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetAvailabilityQuery(
    {
      userId: mentorId || '',
      from: availabilityRange?.from || '',
      to: availabilityRange?.to || '',
    },
    { skip: !mentorId || !availabilityRange?.from || !availabilityRange?.to },
  );

  const createRecurring = async (dto: CreateRecurringScheduleDto) => {
    return createRecurringMutation(dto).unwrap();
  };

  const updateRecurring = async (scheduleId: string, data: UpdateRecurringScheduleDto) => {
    return updateRecurringMutation({ scheduleId, data }).unwrap();
  };

  const deleteRecurring = async (scheduleId: string) => {
    return deleteRecurringMutation(scheduleId).unwrap();
  };

  const createException = async (dto: CreateScheduleExceptionDto) => {
    return createExceptionMutation(dto).unwrap();
  };

  const deleteException = async (exceptionId: string) => {
    return deleteExceptionMutation(exceptionId).unwrap();
  };

  return {
    recurringSchedules: recurringData?.data || [],
    isRecurringLoading,
    createRecurring,
    isCreatingRecurring,
    updateRecurring,
    isUpdatingRecurring,
    deleteRecurring,
    isDeletingRecurring,
    exceptions: exceptionsData?.data || [],
    isExceptionsLoading,
    createException,
    isCreatingException,
    deleteException,
    isDeletingException,
    availability: availabilityData?.data || [],
    isAvailabilityLoading,
  };
};
