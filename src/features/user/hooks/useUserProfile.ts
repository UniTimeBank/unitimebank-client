import { useGetMeQuery, useUpdateMeMutation, useUploadAvatarMutation } from '@/core/api/user';
import { useUploadFileDirectMutation } from '@/core/api/upload';
import type { UpdateProfileDto } from '../types';

export const useUserProfile = () => {
  const { data: profile, isLoading, error, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [uploadFileDirect, { isLoading: isUploadingAvatarFile }] = useUploadFileDirectMutation();

  const handleUpdateProfile = async (dto: UpdateProfileDto) => {
    try {
      const updated = await updateProfile(dto).unwrap();
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      const asset = await uploadFileDirect({ file, purpose: 'AVATAR' }).unwrap();
      const res = await uploadAvatar({
        publicId: asset.publicId,
        resourceType: 'image',
      }).unwrap();
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: handleUpdateProfile,
    isUpdating,
    uploadAvatar: handleUploadAvatar,
    isUploadingAvatar: isUploadingAvatar || isUploadingAvatarFile,
  };
};
