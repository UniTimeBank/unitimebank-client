import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Modal, Button, Select } from '@/shared/components/ui';
import { useCreateGroupMutation } from '@/core/api/community/communityApi';
import { CREATE_GROUP_CATEGORIES, PRESET_GROUP_COVERS, DEFAULT_GROUP_RULES } from '@/features/post/constants';
import { toast } from 'react-hot-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CREATE_GROUP_CATEGORIES[0]);
  const [coverUrl, setCoverUrl] = useState(PRESET_GROUP_COVERS[0].url);
  const [customCover, setCustomCover] = useState('');
  const [rules, setRules] = useState<string[]>([...DEFAULT_GROUP_RULES]);
  const [newRule, setNewRule] = useState('');

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhóm học tập!');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả cho nhóm!');
      return;
    }

    try {
      const finalCover = customCover.trim() || coverUrl;
      const created = await createGroup({
        name: name.trim(),
        description: description.trim(),
        category,
        coverUrl: finalCover,
        rules: rules.filter((r) => r.trim().length > 0),
        isPublic: true,
      }).unwrap();

      toast.success('Tạo nhóm học tập thành công!');
      onClose();
      if (onSuccess && created._id) {
        onSuccess(created._id);
      }
    } catch (err: unknown) {
      const errorMsg = (err as { data?: { message?: string } })?.data?.message || 'Có lỗi xảy ra khi tạo nhóm. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  };

  const categoryOptions = CREATE_GROUP_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Nhóm Học Tập Mới"
      description="Xây dựng không gian trao đổi học thuật dành cho sinh viên UniTime"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Tên nhóm */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Tên nhóm học tập <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Hội Ôn Thi Giải Tích 1 - ĐHBK, Lập Trình Frontend ReactJS..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 outline-none transition-all font-medium"
            required
          />
        </div>

        {/* Chuyên ngành / Danh mục Select từ shared */}
        <Select
          label="Lĩnh vực / Chuyên ngành *"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="Chọn lĩnh vực hoặc chuyên ngành..."
        />

        {/* Mô tả nhóm */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Mô tả mục tiêu nhóm <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Nhóm dành cho sinh viên muốn cùng nhau giải đề, chia sẻ tài liệu và thảo luận các bài toán khó..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 outline-none transition-all font-medium resize-none"
            required
          />
        </div>

        {/* Ảnh bìa nhóm */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Ảnh bìa nhóm
          </label>

          {/* Presets grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_GROUP_COVERS.map((preset) => {
              const isSelected = !customCover && coverUrl === preset.url;
              return (
                <button
                  type="button"
                  key={preset.url}
                  onClick={() => {
                    setCoverUrl(preset.url);
                    setCustomCover('');
                  }}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all cursor-pointer group text-left ${
                    isSelected
                      ? 'border-primary-600 ring-2 ring-primary-400'
                      : 'border-transparent hover:border-gray-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-bold truncate">
                      {preset.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <input
              type="url"
              value={customCover}
              onChange={(e) => setCustomCover(e.target.value)}
              placeholder="Hoặc dán URL ảnh bìa tùy chỉnh (https://...)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Quy tắc nhóm */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Quy tắc cộng đồng của nhóm
          </label>

          <div className="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 text-xs bg-white px-3 py-2 rounded-xl border border-gray-100 text-gray-700 font-medium"
              >
                <span className="truncate">
                  {idx + 1}. {rule}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
                placeholder="Thêm quy tắc mới..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-medium"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3.5 py-2 text-xs font-bold bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-xl transition-colors cursor-pointer"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Tạo nhóm ngay
          </Button>
        </div>
      </form>
    </Modal>
  );
};
