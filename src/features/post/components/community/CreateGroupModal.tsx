import React, { useState } from 'react';
import { X, Users, Image, Sparkles, BookOpen, ShieldCheck, Check } from 'lucide-react';
import { useCreateGroupMutation } from '@/core/api/community/communityApi';
import { toast } from 'react-hot-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (groupId: string) => void;
}

const CATEGORIES = [
  'Công nghệ thông tin',
  'Toán học & Giải tích',
  'Ngoại ngữ & IELTS',
  'Kinh tế & Marketing',
  'Thiết kế & Đồ họa',
  'Khoa học cơ bản',
  'Đời sống sinh viên',
  'Khác',
];

const PRESET_COVERS = [
  {
    label: 'Công nghệ / Lập trình',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Toán học / Học thuật',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Ngoại ngữ / Giao tiếp',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Kinh tế / Khởi nghiệp',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Đời sống / Thảo luận chung',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop',
  },
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [customCover, setCustomCover] = useState('');
  const [rules, setRules] = useState([
    'Tôn trọng và lịch sự với tất cả thành viên trong nhóm.',
    'Chia sẻ kiến thức, tài liệu chính xác và có nguồn gốc rõ ràng.',
    'Không spam hoặc đăng nội dung không liên quan đến chủ đề nhóm.',
  ]);
  const [newRule, setNewRule] = useState('');

  if (!isOpen) return null;

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
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra khi tạo nhóm. Vui lòng thử lại!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden my-8 transform transition-all">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black">Tạo Nhóm Học Tập Mới</h2>
                <p className="text-xs text-primary-100 font-medium">
                  Xây dựng không gian trao đổi học thuật dành cho sinh viên
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Tên nhóm */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <span>Tên nhóm học tập</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hội Ôn Thi Giải Tích 1 - ĐHBK, Lập Trình Frontend ReactJS..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              required
            />
          </div>

          {/* Chuyên ngành / Danh mục */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary-600" />
              <span>Lĩnh vực / Chuyên ngành</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all font-medium cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Mô tả nhóm */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <span>Mô tả mục tiêu nhóm</span>
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Nhóm dành cho sinh viên muốn cùng nhau giải đề, chia sẻ tài liệu và thảo luận các bài toán khó..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-all font-medium resize-none"
              required
            />
          </div>

          {/* Ảnh bìa (Cover Image) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-primary-600" />
              <span>Ảnh bìa nhóm</span>
            </label>

            {/* Presets grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_COVERS.map((preset) => {
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
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500 font-medium"
              />
            </div>
          </div>

          {/* Quy tắc nhóm */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              <span>Quy tắc cộng đồng của nhóm</span>
            </label>

            <div className="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-gray-700 font-medium"
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
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-3 py-1.5 text-xs font-bold bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-xl transition-colors cursor-pointer"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo nhóm ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
