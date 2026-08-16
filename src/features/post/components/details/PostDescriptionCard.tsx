import React from 'react';
import { FileText } from 'lucide-react';
import { RichTextViewer } from '../create-post/RichTextEditor';

interface PostDescriptionCardProps {
  title?: string;
  description?: string;
  shortDescription?: string;
}

export const PostDescriptionCard: React.FC<PostDescriptionCardProps> = ({
  title = 'Mô tả chi tiết',
  description,
  shortDescription,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Description Content */}
      <div className="text-sm text-gray-700 leading-relaxed">
        {description ? (
          <RichTextViewer content={description} />
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            {shortDescription ||
              'Nội dung chi tiết giúp làm rõ mục tiêu, kiến thức và định hướng thực hành để đảm bảo buổi học đạt hiệu quả cao nhất.'}
          </p>
        )}
      </div>
    </div>
  );
};
