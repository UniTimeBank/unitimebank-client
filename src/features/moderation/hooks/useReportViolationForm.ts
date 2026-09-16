import { useState, useRef } from 'react';
import { useReportViolationMutation } from '@/core/api/moderation';
import { useUploadFileDirectMutation } from '@/core/api/upload';
import type { ReportCategory } from '../types';
import toast from 'react-hot-toast';

export interface SelectedEvidenceFile {
  id: string;
  file: File;
  previewUrl?: string;
}

export interface UseReportViolationFormOptions {
  targetUserId: string;
  targetType?: string;
  targetId?: string;
  onSuccess?: () => void;
  onClose: () => void;
  maxFiles?: number;
  initialFiles?: File[];
}

export const useReportViolationForm = ({
  targetUserId,
  targetType = 'USER',
  targetId,
  onSuccess,
  onClose,
  maxFiles = 3,
  initialFiles,
}: UseReportViolationFormOptions) => {
  const [category, setCategory] = useState<ReportCategory>('AFK_ABUSE');
  const [description, setDescription] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedEvidenceFile[]>(() => {
    if (initialFiles && initialFiles.length > 0) {
      return initialFiles.slice(0, maxFiles).map((file) => ({
        id: `${file.name}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));
    }
    return [];
  });
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [reportViolation, { isLoading: isReporting }] = useReportViolationMutation();
  const [uploadFileDirect] = useUploadFileDirectMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const availableSlots = maxFiles - selectedFiles.length;
    if (availableSlots <= 0) {
      toast.error(`Bạn chỉ được tải lên tối đa ${maxFiles} file bằng chứng`);
      return;
    }

    const newFiles: SelectedEvidenceFile[] = [];
    const filesArray = Array.from(fileList).slice(0, availableSlots);

    for (const file of filesArray) {
      const isVideo = file.type.startsWith('video/');
      const maxSizeBytes = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(`File "${file.name}" vượt quá dung lượng tối đa ${isVideo ? '100MB' : '10MB'}`);
        continue;
      }

      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      newFiles.push({
        id: `${file.name}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl,
      });
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const attachFile = (file: File) => {
    if (selectedFiles.length >= maxFiles) {
      toast.error(`Bạn chỉ được tải lên tối đa ${maxFiles} file bằng chứng`);
      return;
    }
    const isVideo = file.type.startsWith('video/');
    const maxSizeBytes = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File "${file.name}" vượt quá dung lượng tối đa ${isVideo ? '100MB' : '10MB'}`);
      return;
    }
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setSelectedFiles((prev) => [
      ...prev,
      {
        id: `${file.name}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl,
      },
    ]);
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const cleanupAllFiles = () => {
    selectedFiles.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết sự cố');
      return;
    }

    try {
      let evidenceUrls: Array<{ url: string; kind: string }> | undefined = undefined;

      // Upload all selected evidence files (up to maxFiles)
      if (selectedFiles.length > 0) {
        setIsUploadingFiles(true);
        try {
          const uploadPromises = selectedFiles.map((item) =>
            uploadFileDirect({
              file: item.file,
              purpose: 'REPORT_EVIDENCE',
            }).unwrap(),
          );

          const uploadResults = await Promise.all(uploadPromises);

          evidenceUrls = uploadResults
            .filter((res) => !!res?.secureUrl)
            .map((res, idx) => ({
              url: res.secureUrl,
              kind: selectedFiles[idx].file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
            }));
        } catch (uploadErr: any) {
          console.error('Evidence upload error:', uploadErr);
          toast.error('Không thể tải file bằng chứng lên máy chủ, vui lòng thử lại.');
          setIsUploadingFiles(false);
          return;
        } finally {
          setIsUploadingFiles(false);
        }
      }

      await reportViolation({
        targetUserId,
        targetType,
        targetId: targetId || targetUserId,
        category,
        description: description.trim(),
        evidenceUrls,
      }).unwrap();

      toast.success('Báo cáo của bạn đã được tiếp nhận và sẽ được xử lý sớm nhất.');
      cleanupAllFiles();
      setDescription('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || 'Không thể gửi báo cáo vi phạm, vui lòng thử lại sau.';
      toast.error(msg);
    }
  };

  const isSubmitting = isReporting || isUploadingFiles;

  return {
    category,
    setCategory,
    description,
    setDescription,
    selectedFiles,
    isSubmitting,
    isUploadingFiles,
    fileInputRef,
    handleFileChange,
    handleRemoveFile,
    attachFile,
    cleanupAllFiles,
    handleSubmit,
    maxFiles,
  };
};
