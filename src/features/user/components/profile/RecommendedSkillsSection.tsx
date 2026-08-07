import React from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface RecommendedSkill {
  id: string;
  title: string;
  category: string;
  categoryBg: string;
  image: string;
  rating: number;
  rate: string;
}

interface RecommendedSkillsSectionProps {
  recommendedSkills: RecommendedSkill[];
}

export const RecommendedSkillsSection: React.FC<RecommendedSkillsSectionProps> = ({
  recommendedSkills,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gợi ý dành cho bạn</h2>
          <p className="text-xs text-gray-500">Dựa trên sở thích Khoa học dữ liệu & Thiết kế UI của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xs cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xs cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {recommendedSkills.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="h-36 overflow-hidden relative bg-gray-100">
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span
                className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md tracking-wider ${item.categoryBg}`}
              >
                {item.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary-500 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="font-semibold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating}</span>
                </span>
                <span className="font-bold text-gray-600">{item.rate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
