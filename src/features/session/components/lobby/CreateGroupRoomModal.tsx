import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Sparkles, Loader2 } from 'lucide-react';
import { useCreateGroupRoomMutation } from '@/core/api/session';
import { toast } from '@/shared/utils';

interface CreateGroupRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupRoomModal: React.FC<CreateGroupRoomModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [createRoom, { isLoading }] = useCreateGroupRoomMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên phòng học nhóm.');
      return;
    }

    try {
      const res = await createRoom({
        title: title.trim(),
        category: category.trim() || undefined,
        maxParticipants,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Mở phòng học nhóm trực tuyến
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên phòng học / Chủ đề thảo luận <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Ôn thi Cấu trúc Dữ liệu & Giải thuật..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chủ đề / Môn học
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="VD: Lập trình, Ngoại ngữ, Thiết kế..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Số lượng người tham gia tối đa
            </label>
            <input
              type="number"
              min={2}
              max={30}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo & Vào phòng ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
