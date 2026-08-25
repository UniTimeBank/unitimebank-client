import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Sparkles, Loader2, Infinity as InfinityIcon, Check, Plus, X } from 'lucide-react';
import { Modal, Button, Select } from '@/shared/components/ui';
import { useCreateGroupRoomMutation } from '@/core/api/session';
import { AddSkillModal, useUserSkills } from '@/features/user';
import type { SkillCategoryEnum } from '@/features/user/types';
import { toast } from '@/shared/utils';

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
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('PROGRAMMING');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  
  const { skills: mySkills, addSkill } = useUserSkills();
  const [createRoom, { isLoading }] = useCreateGroupRoomMutation();

  // Lọc kỹ năng của người dạy theo danh mục đã chọn
  const filteredSkills = useMemo(() => {
    if (!selectedCategory) return mySkills;
    const norm = selectedCategory.toUpperCase();
    return mySkills.filter(
      (s: any) => s.category?.toUpperCase() === norm || !s.category,
    );
  }, [mySkills, selectedCategory]);

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
        category: selectedSkill,
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
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <span>Mở phòng học nhóm trực tuyến</span>
          </div>
        }
        description="Tạo không gian học tập và trao đổi trực tiếp thời gian thực cùng bạn bè sinh viên."
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* 1. Tên phòng - Nền trắng sạch sẽ */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              TÊN PHÒNG HỌC / CHỦ ĐỀ THẢO LUẬN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ôn thi Cấu trúc Dữ liệu & Giải thuật..."
              className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all shadow-2xs"
              required
            />
          </div>

          {/* 2. Danh mục lĩnh vực */}
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

          {/* 3. Kỹ năng bài dạy - Giống 100% Ảnh 2 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                KỸ NĂNG BÀI DẠY <span className="text-red-500">*</span>
              </label>
              {selectedSkill && (
                <span className="text-[11px] font-normal text-gray-400">
                  Đã chọn 1 kỹ năng
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 min-h-[50px] transition-all">
              {/* Chip kỹ năng đã chọn */}
              {selectedSkill && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-300 text-primary-800 text-xs font-bold shadow-2xs animate-in fade-in zoom-in-95 duration-100">
                  <Check className="w-3.5 h-3.5 text-primary-600" />
                  <span>{selectedSkill}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSkill('')}
                    className="w-4 h-4 rounded-full hover:bg-primary-100 text-primary-600 flex items-center justify-center cursor-pointer -mr-0.5"
                    title="Bỏ chọn"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Các kỹ năng có sẵn từ hồ sơ */}
              {filteredSkills.map((skill: any) => {
                if (skill.skillName === selectedSkill) return null;
                return (
                  <button
                    key={skill.id || skill.skillName}
                    type="button"
                    onClick={() => setSelectedSkill(skill.skillName)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 text-xs font-medium bg-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-gray-400" />
                    <span>{skill.skillName}</span>
                  </button>
                );
              })}

              {/* Nút + Thêm kỹ năng mới */}
              <button
                type="button"
                onClick={() => setIsAddSkillModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-primary-500 text-primary-700 hover:bg-primary-50 text-xs font-bold bg-white transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>

            {!selectedSkill && (
              <p className="mt-1.5 text-[11px] text-gray-400 font-normal italic">
                Bấm chọn 1 kỹ năng hoặc nhấn "+ Thêm" để bổ sung kỹ năng mới vào hồ sơ.
              </p>
            )}
          </div>

          {/* 4. Giới hạn số người tham gia - Clean & Ngắn gọn */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              SỐ LƯỢNG NGƯỜI THAM GIA
            </label>

            {/* Segmented Options: Có giới hạn vs Không giới hạn */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsUnlimited(false)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isUnlimited
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-primary-600" />
                <span>Có giới hạn</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUnlimited(true)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isUnlimited
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <InfinityIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Không giới hạn</span>
              </button>
            </div>

            {/* Input số người khi chọn Có giới hạn */}
            {!isUnlimited && (
              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs hover:border-gray-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                  <button
                    type="button"
                    onClick={() => setMaxParticipants((prev) => Math.max(2, prev - 1))}
                    className="w-8 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer border-r border-gray-100 select-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Math.max(2, Math.min(50, Number(e.target.value))))}
                    className="w-12 h-9 text-center text-sm font-bold text-gray-900 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setMaxParticipants((prev) => Math.min(50, prev + 1))}
                    className="w-8 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer border-l border-gray-100 select-none"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500 font-normal">
                  người (Tối đa 50 người)
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold px-4 py-2 cursor-pointer"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold px-4 py-2 shadow-xs flex items-center gap-1.5 cursor-pointer"
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
