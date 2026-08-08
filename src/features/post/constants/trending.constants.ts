import type { TrendingItem } from '../types';

export const DEFAULT_TRENDING: TrendingItem[] = [
  {
    id: 't1',
    category: 'TOÁN CAO CẤP',
    duration: '60 phút',
    title: 'Gia Sư Giải Tích 1 & Biến Đổi Fourier',
    description: 'Nắm vững đạo hàm, tích phân và chuỗi Fourier trước kỳ thi giữa kỳ.',
    mentorName: 'Sarah J.',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 't2',
    category: 'THIẾT KẾ',
    duration: '45 phút',
    title: 'Đánh Giá & Review Portfolio Figma',
    description: 'Tút lại hồ sơ thiết kế UI/UX để ứng tuyển thực tập hè.',
    mentorName: 'Alex M.',
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 't3',
    category: 'NGOẠI NGỮ',
    duration: '30 phút',
    title: 'Luyện Giao Tiếp Tiếng Anh / Tây Ban Nha',
    description: 'Trò chuyện tự nhiên giúp tăng phản xạ và độ tự tin khi nói.',
    mentorName: 'Elena R.',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  },
];
