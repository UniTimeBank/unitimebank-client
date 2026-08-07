import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { Modal, Input, Button } from '@/shared/components/ui';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDisplayName?: string;
  initialBio?: string;
  initialAvatarUrl?: string;
  onSave: (displayName: string, bio: string, avatarFile?: File) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialDisplayName = '',
  initialBio = '',
  initialAvatarUrl = '',
  onSave,
}) => {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDisplayName(initialDisplayName);
    setBio(initialBio);
  }, [initialDisplayName, initialBio, isOpen]);

  const currentAvatar = previewUrl || initialAvatarUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(displayName, bio, avatarFile);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa hồ sơ cá nhân" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar Upload with Camera Overlay */}
        <div className="flex flex-col items-center gap-2.5">
          <label className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary-50 shadow-xs border border-gray-100 flex items-center justify-center bg-gray-50">
              {currentAvatar ? (
                <img src={currentAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xl">
                  {displayName.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <label className="cursor-pointer text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Tải ảnh đại diện mới</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* Display Name - Backend MaxLength 50 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Tên hiển thị
            </label>
            <span className="text-[10px] text-gray-400 font-medium">{displayName.length}/50</span>
          </div>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            required
            placeholder="Nhập tên hiển thị của bạn..."
          />
        </div>

        {/* Bio - Spacious Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Tiểu sử / Giới thiệu bản thân
            </label>
            <span className="text-[10px] text-gray-400 font-medium">{bio.length}/500</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={6}
            className="w-full min-h-[150px] px-4 py-3 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none leading-relaxed"
            placeholder="Chia sẻ thêm về chuyên ngành, sở thích và kinh nghiệm của bạn..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
