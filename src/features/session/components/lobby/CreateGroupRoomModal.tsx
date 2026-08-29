import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Loader2,
  Infinity as InfinityIcon,
  Check,
  Plus,
  ImageIcon,
  UploadCloud,
  X,
} from 'lucide-react';
import { Modal, Button, Select } from '@/shared/components/ui';
import { useCreateGroupRoomMutation } from '@/core/api/session';
import { useUploadFileDirectMutation } from '@/core/api/upload';
import { AddSkillModal, useUserSkills } from '@/features/user';
import type { SkillCategoryEnum } from '@/features/user/types';
import { toast } from '@/shared/utils';
import {
  CATEGORY_PRESET_IMAGES,
  FALLBACK_CATEGORY_IMAGES,
  DEFAULT_POST_COVER,
} from '@/features/post/constants';

interface CreateGroupRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { label: 'Lập trình', value: 'PROGRAMMING' },
  { label: 'Ngoại ngữ', value: 'LANGUAGE' },
  { label: 'Thiết kế', value: 'DESIGN' },
  { label: 'Học thuật', value: 'ACADEMIC' },
  { label: 'Kinh doanh', value: 'BUSINESS' },
  { label: 'Kỹ năng mềm', value: 'SOFT_SKILLS' },
  { label: 'Âm nhạc', value: 'MUSIC' },
  { label: 'Thể thao', value: 'SPORTS' },
  { label: 'Khác', value: 'OTHER' },
];

export const CreateGroupRoomModal: React.FC<CreateGroupRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('PROGRAMMING');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedCoverImage, setSelectedCoverImage] = useState<string>('');
  const [customUploadedUrl, setCustomUploadedUrl] = useState<string | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);

  const { skills: mySkills, addSkill } = useUserSkills();
  const [createRoom, { isLoading }] = useCreateGroupRoomMutation();
  const [uploadDirect, { isLoading: isUploadingImage }] = useUploadFileDirectMutation();

  // Danh sách ảnh mẫu theo danh mục
  const presetImages = useMemo(() => {
    return CATEGORY_PRESET_IMAGES[selectedCategory] || CATEGORY_PRESET_IMAGES['PROGRAMMING'];
  }, [selectedCategory]);

  // Cập nhật ảnh bìa khi đổi danh mục nếu người dùng chưa tải ảnh riêng
  useEffect(() => {
    if (!customUploadedUrl) {
      setSelectedCoverImage(FALLBACK_CATEGORY_IMAGES[selectedCategory] || presetImages[0]);
    }
  }, [selectedCategory, presetImages, customUploadedUrl]);

  // Lọc kỹ năng của người dạy theo danh mục đã chọn
  const filteredSkills = useMemo(() => {
    if (!selectedCategory) return mySkills;
    const norm = selectedCategory.toUpperCase();
    return mySkills.filter(
      (s: any) => s.category?.toUpperCase() === norm || !s.category,
    );
  }, [mySkills, selectedCategory]);

  // Xử lý upload ảnh từ thiết bị
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn định dạng file ảnh (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    try {
      const res = await uploadDirect({ file, purpose: 'AVATAR' }).unwrap();
      setSelectedCoverImage(res.secureUrl);
      setCustomUploadedUrl(res.secureUrl);
      toast.success('Đã tải ảnh bìa thành công!');
    } catch {
      // Local fallback nếu upload có sự cố
      const localUrl = URL.createObjectURL(file);
      setSelectedCoverImage(localUrl);
      setCustomUploadedUrl(localUrl);
      toast.success('Đã chọn ảnh bìa từ thiết bị.');
    }
  };

  const handleRemoveCustomImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomUploadedUrl(null);
    setSelectedCoverImage(FALLBACK_CATEGORY_IMAGES[selectedCategory] || presetImages[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên phòng học nhóm.');
      return;
    }

    if (!selectedCategory) {
      toast.error('Vui lòng chọn danh mục lĩnh vực.');
      return;
    }

    if (!selectedSkill) {
      toast.error('Vui lòng chọn kỹ năng bài dạy.');
      return;
    }

    try {
      const res = await createRoom({
        title: title.trim(),
        category: selectedCategory,
        maxParticipants: isUnlimited ? 100 : maxParticipants,
      }).unwrap();

      toast.success('Tạo phòng học nhóm thành công!');
      onClose();
      navigate(`/rooms/group/${res.roomId}`);
    } catch (err: any) {
      console.error('Failed to create group room:', err);
      toast.error(err?.data?.message || 'Lỗi khi tạo phòng học nhóm.');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isAddSkillModalOpen}
        onClose={onClose}
        size="3xl"
        title={
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <div className="w-8.5 h-8.5 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
            <span>Mở phòng học nhóm trực tuyến</span>
          </div>
        }
        description="Tạo không gian học tập và trao đổi trực tiếp thời gian thực cùng bạn bè sinh viên."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* 1. Tên phòng học (Toàn chiều ngang) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              TÊN PHÒNG HỌC / CHỦ ĐỀ THẢO LUẬN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ôn thi Cấu trúc Dữ liệu & Giải thuật..."
              className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all shadow-2xs"
              required
            />
          </div>

          {/* 2. Grid 2 cột: Danh mục lĩnh vực (Trái) & Số lượng người tham gia (Phải) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {/* Danh mục */}
            <div>
              <Select
                label="DANH MỤC LĨNH VỰC *"
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedSkill('');
                }}
                options={CATEGORY_OPTIONS}
                placeholder="-- Chọn danh mục lĩnh vực --"
              />
            </div>

            {/* Số lượng người tham gia */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                SỐ LƯỢNG NGƯỜI THAM GIA
              </label>

              <div className="flex items-center gap-2.5">
                {/* Segmented switcher */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-50 rounded-xl border border-gray-200/80 shadow-2xs flex-1">
                  <button
                    type="button"
                    onClick={() => setIsUnlimited(false)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !isUnlimited
                        ? 'bg-primary-700 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                    }`}
                  >
                    <Users
                      className={`w-3.5 h-3.5 shrink-0 ${
                        !isUnlimited ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span>Giới hạn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUnlimited(true)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isUnlimited
                        ? 'bg-primary-700 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                    }`}
                  >
                    <InfinityIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isUnlimited ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span>Vô tận</span>
                  </button>
                </div>

                {/* Stepper số lượng khi Có giới hạn */}
                {!isUnlimited && (
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setMaxParticipants((prev) => Math.max(2, prev - 1))}
                      className="w-7 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer border-r border-gray-100 select-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(Math.max(2, Math.min(50, Number(e.target.value))))}
                      className="w-10 h-8 text-center text-xs font-bold text-gray-900 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setMaxParticipants((prev) => Math.min(50, prev + 1))}
                      className="w-7 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer border-l border-gray-100 select-none"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Kỹ năng bài dạy (Trải rộng toàn bộ chiều ngang, cuộn mượt mà khi nhiều kỹ năng) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                KỸ NĂNG BÀI DẠY <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                {selectedSkill ? `Đã chọn: ${selectedSkill}` : 'Chọn 1 kỹ năng'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl max-h-20 overflow-y-auto shadow-2xs">
              {filteredSkills.length === 0 ? (
                <span className="text-xs text-gray-400 italic py-0.5">
                  Chưa có kỹ năng nào thuộc lĩnh vực này trong hồ sơ của bạn.
                </span>
              ) : (
                filteredSkills.map((skill: any) => {
                  const isSelected = selectedSkill === skill.skillName;
                  return (
                    <button
                      type="button"
                      key={skill.id || skill.skillName}
                      onClick={() => setSelectedSkill(isSelected ? '' : skill.skillName)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer select-none ${
                        isSelected
                          ? 'bg-primary-700 text-white border-primary-700 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </span>
                      <span>{skill.skillName}</span>
                    </button>
                  );
                })
              )}

              {/* Nút + Thêm kỹ năng mới */}
              <button
                type="button"
                onClick={() => setIsAddSkillModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-dashed border-emerald-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* 4. Ảnh bìa phòng học (Trải rộng toàn bộ chiều ngang 5 ô to rõ ràng ~135px x 85px) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <span>ẢNH BÌA PHÒNG HỌC</span>
              </label>
              {customUploadedUrl && (
                <span className="text-[11px] font-medium text-emerald-600 shrink-0">
                  (Đang dùng ảnh từ máy)
                </span>
              )}
            </div>

            {/* 5 Ô ảnh ngang to rõ ràng chuẩn tỉ lệ 16:10 */}
            <div className="grid grid-cols-5 gap-2.5">
              {/* Ô 1: Upload từ máy */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-[16/10] w-full rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden select-none group ${
                  customUploadedUrl && selectedCoverImage === customUploadedUrl
                    ? 'border-primary-600 ring-2 ring-primary-100 shadow-xs'
                    : 'border-dashed border-slate-300 hover:border-primary-400 bg-slate-50/70 hover:bg-primary-50/30'
                }`}
              >
                {customUploadedUrl ? (
                  <>
                    <img
                      src={customUploadedUrl}
                      alt="Custom upload"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary-950/20 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    </div>
                    {/* Nút xóa ảnh upload */}
                    <button
                      type="button"
                      onClick={handleRemoveCustomImage}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                      title="Xóa ảnh và dùng ảnh mẫu"
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-primary-700">
                    {isUploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                    ) : (
                      <UploadCloud className="w-5 h-5 mb-1" />
                    )}
                    <span className="text-[11px] font-bold">Tải ảnh</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* 4 Presets HD to rõ nét */}
              {presetImages.map((imgUrl, idx) => {
                const isSelected = selectedCoverImage === imgUrl && !customUploadedUrl;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedCoverImage(imgUrl);
                      setCustomUploadedUrl(null);
                    }}
                    className={`relative aspect-[16/10] w-full rounded-xl overflow-hidden border-2 transition-colors cursor-pointer bg-slate-100 select-none ${
                      isSelected
                        ? 'border-primary-600 ring-2 ring-primary-100 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Mẫu ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_POST_COVER;
                      }}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary-950/25 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-4.5 py-2 cursor-pointer"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || isUploadingImage}
              className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold px-6 py-2 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isLoading ? 'Đang tạo...' : 'Tạo & Vào phòng ngay'}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal thêm nhanh kỹ năng mới vào hồ sơ */}
      {isAddSkillModalOpen && (
        <AddSkillModal
          isOpen={isAddSkillModalOpen}
          onClose={() => setIsAddSkillModalOpen(false)}
          defaultCategory={selectedCategory as SkillCategoryEnum}
          onAddSkill={async (skillName, category, isStrong) => {
            const res = await addSkill({ skillName, category, isStrong });
            if (res.success) {
              setSelectedSkill(skillName);
              setIsAddSkillModalOpen(false);
              toast.success('Đã thêm kỹ năng vào hồ sơ!');
            } else {
              toast.error('Không thể thêm kỹ năng.');
            }
          }}
        />
      )}
    </>
  );
};
