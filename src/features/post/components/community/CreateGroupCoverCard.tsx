import React from 'react';
import { Check } from 'lucide-react';
import { PRESET_GROUP_COVERS } from '@/features/post/constants';

interface CreateGroupCoverCardProps {
  coverUrl: string;
  onCoverUrlChange: (url: string) => void;
  customCover: string;
  onCustomCoverChange: (url: string) => void;
}

export const CreateGroupCoverCard: React.FC<CreateGroupCoverCardProps> = ({
  coverUrl,
  onCoverUrlChange,
  customCover,
  onCustomCoverChange,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-5">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900">2. Ảnh bìa nhóm</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Chọn ảnh bìa đại diện cho chủ đề nhóm hoặc dán đường dẫn ảnh tùy chỉnh
        </p>
      </div>

      {/* Presets grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PRESET_GROUP_COVERS.map((preset) => {
          const isSelected = !customCover && coverUrl === preset.url;
          return (
            <button
              type="button"
              key={preset.url}
              onClick={() => {
                onCoverUrlChange(preset.url);
                onCustomCoverChange('');
              }}
              className={`relative rounded-2xl overflow-hidden h-24 border-2 transition-all cursor-pointer group text-left ${
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-2">
                <span className="text-[11px] text-white font-bold truncate">
                  {preset.label}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Hoặc đường dẫn ảnh tùy chỉnh
        </label>
        <input
          type="url"
          value={customCover}
          onChange={(e) => onCustomCoverChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400 outline-none transition-all font-medium"
        />
      </div>
    </div>
  );
};
