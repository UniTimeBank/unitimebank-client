import React, { useState } from 'react';
import { Sparkles, Users, Plus, ChevronDown } from 'lucide-react';
import { useLearnerRequests } from '../hooks';
import { LearnerRequestCard, PostFilterBar, CreateLearnerRequestModal } from '../components';
import type { LearnerRequest } from '../types';

export const OpenRequestsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('High to Low');
  const [selectedUrgency, setSelectedUrgency] = useState('Any');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Dùng Custom Hook useLearnerRequests
  const { requests, total, isLoading, refetch } = useLearnerRequests({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    page: 1,
    limit: 12,
  });

  // Mock sample requests nếu chưa có dữ liệu từ backend
  const sampleRequests: LearnerRequest[] = [
    {
      _id: '1',
      learnerId: 'u1',
      learnerName: 'Marcus Thorne',
      skillNeeded: 'Giải Tích Nâng Cao & Biến Đổi Fourier',
      category: 'STEM',
      description:
        'Mình đang gặp khó khăn trong việc hiểu bản chất miền tần số trước kỳ thi giữa kỳ vào thứ Năm. Cần một buổi học 2 tiếng để cùng giải các bài tập ứng dụng thực tế.',
      sessionType: 'ONE_ON_ONE' as any,
      expectedDurationMinutes: 120,
      expectedCreditAmount: 120,
      desiredSlots: [],
      status: 'OPEN' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '2',
      learnerId: 'u2',
      learnerName: 'Alex Rivera',
      skillNeeded: 'Lập Trình Python: Mảng & List Comprehensions',
      category: 'STEM',
      description:
        'Cần bạn hướng dẫn cú pháp list comprehension và xử lý mảng cơ bản trong bài thực hành Python tuần này.',
      sessionType: 'ONE_ON_ONE' as any,
      expectedDurationMinutes: 45,
      expectedCreditAmount: 45,
      desiredSlots: [],
      status: 'OPEN' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '3',
      learnerId: 'u3',
      learnerName: 'Chloe Bennett',
      skillNeeded: 'Kỹ Thuật Vẽ Kỹ Thuật Số (Digital Painting)',
      category: 'ARTS',
      description:
        'Đang học vẽ trên Procreate, cần hướng dẫn cách chỉnh ổn định nét cọ và các lớp layer để vẽ chân dung.',
      sessionType: 'ONE_ON_ONE' as any,
      expectedDurationMinutes: 60,
      expectedCreditAmount: 60,
      desiredSlots: [],
      status: 'OPEN' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '4',
      learnerId: 'u4',
      learnerName: 'David Vance',
      skillNeeded: 'Góp Ý & Chỉnh Sửa Tiểu Luận Lịch Sử',
      category: 'HUMANITIES',
      description:
        'Đang viết bài về Cách mạng Công nghiệp. Cần một bạn đọc phản biện để kiểm tra luận điểm và cấu trúc bài viết.',
      sessionType: 'ONE_ON_ONE' as any,
      expectedDurationMinutes: 30,
      expectedCreditAmount: 30,
      desiredSlots: [],
      status: 'OPEN' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: '5',
      learnerId: 'u5',
      learnerName: 'Sophia Miller',
      skillNeeded: 'Lý Thuyết Trò Chơi: Cân Bằng Nash',
      category: 'ECONOMICS',
      description:
        'Các bài tập giải thế cân bằng trò chơi không hợp tác khá hóc búa. Cần một bạn chuyên sâu kinh tế giải thích logic.',
      sessionType: 'ONE_ON_ONE' as any,
      expectedDurationMinutes: 90,
      expectedCreditAmount: 90,
      desiredSlots: [],
      status: 'OPEN' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayedRequests = requests && requests.length > 0 ? requests : sampleRequests;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* 1. Hero Header Banner (Dark Navy) */}
        <div className="bg-[#1b2a3a] text-white rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Bảng Yêu Cầu Tìm Người Dạy
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Hỗ trợ bạn học, tích lũy credit. Khám phá các yêu cầu từ cộng đồng và chia sẻ kiến thức của bạn để gia tăng số dư Ví Thời Gian.
            </p>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Yêu Cầu Học</span>
            </button>
          </div>
        </div>

        {/* 2. Filter Bar */}
        <PostFilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          selectedUrgency={selectedUrgency}
          onUrgencyChange={setSelectedUrgency}
          activeCount={total || displayedRequests.length}
        />

        {/* 3. Requests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRequests.map((request, idx) => (
            <div key={request._id || idx} className={idx === 0 ? 'md:col-span-2' : ''}>
              <LearnerRequestCard
                request={request}
                isUrgent={idx === 0}
                featured={idx === 0}
                onTeachClick={() => {
                  alert(`Đã nhận yêu cầu dạy môn: "${request.skillNeeded}". Bạn sẽ được kết nối trao đổi với bạn học!`);
                }}
              />
            </div>
          ))}

          {/* 4. Don't see a topic? Mint Gradient Banner */}
          <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-r from-[#4ef1c5] to-[#79f7cf] text-teal-950 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="max-w-md relative z-10">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                Chưa tìm thấy môn bạn cần?
              </h3>
              <p className="text-xs md:text-sm font-medium text-teal-900 leading-relaxed mb-6">
                Tạo yêu cầu học tập riêng của bạn hoặc tham gia các nhóm học tập chuyên môn để cùng trao đổi kiến thức học thuật.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <button
                type="button"
                className="px-6 py-3 rounded-2xl bg-[#005F4F] hover:bg-[#004D40] text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Xem Nhóm Học</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-white/80 hover:bg-white text-teal-950 font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Tạo Yêu Cầu Mới
              </button>
            </div>

            {/* Background Icon Watermark */}
            <Sparkles className="absolute right-4 bottom-2 w-44 h-44 text-teal-900/10 pointer-events-none" />
          </div>
        </div>

        {/* 5. Load More Requests Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 rounded-full bg-gray-200/70 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{isLoading ? 'Đang tải...' : 'Xem thêm yêu cầu'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Create Learner Request Modal */}
      <CreateLearnerRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
