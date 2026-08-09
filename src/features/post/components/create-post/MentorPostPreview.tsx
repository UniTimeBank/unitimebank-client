import { Clock, Calendar, ArrowRight, Tag } from 'lucide-react';
import { RichTextViewer } from './RichTextEditor';

interface MentorPostPreviewProps {
  title: string;
  shortDescription?: string;
  description: string;
  coverImage?: string;
  skillsText?: string;
  scheduleType?: 'ALWAYS_OPEN' | 'LIMITED_TIME';
  startDate?: string;
  endDate?: string;
  selectedSlotCount?: number;
}

const formatDateVN = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export const MentorPostPreview: React.FC<MentorPostPreviewProps> = ({
  title,
  shortDescription,
  description,
  coverImage,
  skillsText = '',
  scheduleType = 'ALWAYS_OPEN',
  startDate,
  endDate,
  selectedSlotCount = 0,
}) => {
  const defaultThumbnail =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';

  const skills = skillsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const mainBadge = skills.length > 0 ? skills[0] : 'LỚP HỌC 1:1';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between">
          <span>XEM TRƯỚC BÀI ĐĂNG TRÊN SÀN</span>
          <span className="text-[10px] text-emerald-600 font-extrabold uppercase"></span>
        </h3>

        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            {/* Cover Image & Badges */}
            <div className="relative h-44 overflow-hidden bg-gray-100">
              <img
                src={coverImage || defaultThumbnail}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide bg-white/95 text-gray-900 shadow-2xs">
                {mainBadge}
              </span>
              <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-[#005F4F] text-white font-extrabold text-xs shadow-md">
                60 credit/giờ
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3">
              <h4 className="text-base font-extrabold text-gray-900 line-clamp-2 leading-snug">
                {title || 'Tiêu đề bài dạy của bạn sẽ xuất hiện ở đây...'}
              </h4>

              {/* Real Skills Tag Badges */}
              {skills.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200/80"
                    >
                      <Tag className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 italic">
                  Chưa chọn kỹ năng nào cho bài dạy
                </div>
              )}

              {shortDescription ? (
                <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">
                  {shortDescription}
                </p>
              ) : description ? (
                <RichTextViewer content={description} className="line-clamp-2" />
              ) : (
                <p className="text-xs text-gray-400 font-medium italic">
                  Mô tả lộ trình học và nội dung truyền đạt sẽ hiển thị tại đây...
                </p>
              )}
            </div>
          </div>

          {/* Real Schedule Footer Info */}
          <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
              {scheduleType === 'LIMITED_TIME' ? (
                <>
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {startDate && endDate
                      ? `${formatDateVN(startDate)} - ${formatDateVN(endDate)}`
                      : startDate
                      ? `Từ ${formatDateVN(startDate)}`
                      : 'Lớp có thời hạn'}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    {selectedSlotCount > 0
                      ? `Lịch tuần (${selectedSlotCount} khung giờ)`
                      : 'Chưa chọn lịch rảnh'}
                  </span>
                </>
              )}
            </div>

            <div className="text-teal-800 font-extrabold flex items-center gap-1 text-xs">
              <span>XEM CHI TIẾT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
