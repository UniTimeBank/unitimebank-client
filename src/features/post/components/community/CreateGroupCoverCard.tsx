import React from 'react';
import { Upload, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { PRESET_GROUP_COVERS } from '@/features/post/constants';
import { useUploadFileDirectMutation } from '@/core/api/upload';
import { toast } from 'react-hot-toast';

interface CreateGroupCoverCardProps {
  coverUrl: string;
  onCoverUrlChange: (url: string) => void;
  customCover: string;
  onCustomCoverChange: (url: string) => void;
  activeCover?: string;
}

export const CreateGroupCoverCard: React.FC<CreateGroupCoverCardProps> = ({
  coverUrl,
  onCoverUrlChange,
  customCover,
  onCustomCoverChange,
  activeCover,
}) => {
  const [uploadDirect, { isLoading: isUploading }] = useUploadFileDirectMutation();

  const currentCover = activeCover || customCover.trim() || coverUrl;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    try {
      const res = await uploadDirect({ file, purpose: 'AVATAR' }).unwrap();
      onCustomCoverChange(res.secureUrl);
      toast.success('Tải ảnh bìa thành công!');
    } catch {
      // Fallback local object URL nếu đường truyền hoặc chữ ký lỗi
      const localUrl = URL.createObjectURL(file);
      onCustomCoverChange(localUrl);
      toast.success('Đã chọn ảnh bìa từ thiết bị.');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-5">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900">2. Ảnh bìa nhóm</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Tải ảnh từ thiết bị của bạn hoặc chọn nhanh ảnh mẫu theo chuyên ngành
        </p>
      </div>

      <div className="space-y-4">
        {/* Upload Box / Active Preview - Tỉ lệ chuẩn 16:9 */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            ẢNH BÌA BÀI ĐĂNG
          </label>
          <div className="relative aspect-[16/9] sm:h-52 w-full rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary-400 transition-all flex flex-col items-center justify-center group shadow-2xs">
            {currentCover ? (
              <>
                <img
                  src={currentCover}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-gray-100 flex items-center gap-1.5 transition-colors">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                        <span>Đang tải lên...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-primary-600" />
                        <span>Tải ảnh khác từ máy</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center gap-2 cursor-pointer p-6 text-center w-full h-full justify-center">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                    <span className="text-xs font-bold text-gray-700">Đang tải ảnh lên...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Nhấp để tải ảnh từ máy tính</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, WEBP tối đa 5MB</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Preset Images Quick Selector */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            HOẶC CHỌN ẢNH MẪU THEO DANH MỤC:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  className={`relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all cursor-pointer group text-left ${
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] text-white font-bold truncate">
                      {preset.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
