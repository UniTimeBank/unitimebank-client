import { useState, type FormEvent } from 'react';
import type { GroupPostTag } from '../types';
import { useCreateGroupPostMutation } from '@/core/api/community/communityApi';
import { useUploadFileDirectMutation } from '@/core/api/upload';
import { toast } from 'react-hot-toast';

export const useCreateGroupPostForm = (groupId: string, isMember?: boolean) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<GroupPostTag>('GENERAL');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const [createPost, { isLoading: isPosting }] = useCreateGroupPostMutation();
  const [uploadDirect, { isLoading: isUploading }] = useUploadFileDirectMutation();

  const openModal = (initialTag?: GroupPostTag) => {
    if (initialTag) setSelectedTag(initialTag);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsDragOver(false);
    setIsUrlInputOpen(false);
    setUrlDraft('');
  };

  const resetForm = () => {
    setPostContent('');
    setSelectedTag('GENERAL');
    setImageUrl('');
    setIsUrlInputOpen(false);
    setUrlDraft('');
    closeModal();
  };

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    try {
      const res = await uploadDirect({ file, purpose: 'CHAT_ATTACHMENT' }).unwrap();
      setImageUrl(res.secureUrl);
      toast.success('Đã tải ảnh lên thành công!');
    } catch {
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
      toast.success('Đã chọn ảnh từ thiết bị.');
    }
  };

  const handleApplyUrl = () => {
    if (!urlDraft.trim()) return;
    setImageUrl(urlDraft.trim());
    setUrlDraft('');
    setIsUrlInputOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết!');
      return;
    }
    if (!isMember) {
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
      resetForm();
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Không thể đăng bài viết. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  };

  return {
    isOpen,
    openModal,
    closeModal,
    postContent,
    setPostContent,
    selectedTag,
    setSelectedTag,
    imageUrl,
    setImageUrl,
    isDragOver,
    setIsDragOver,
    isUrlInputOpen,
    setIsUrlInputOpen,
    urlDraft,
    setUrlDraft,
    isUploading,
    isPosting,
    handleProcessFile,
    handleApplyUrl,
    handleSubmit,
  };
};
