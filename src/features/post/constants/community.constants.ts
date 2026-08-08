import type { StudyGroup, TopContributor, CommunityTabType } from '../types';

export const COMMUNITY_TABS: CommunityTabType[] = [
  'Nhóm học tập',
  'Bảng xếp hạng',
  'Sự kiện & Workshop',
];

export const STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'g1',
    name: 'Hội Lập Trình Backend & Cloud DevOps',
    category: 'LẬP TRÌNH',
    membersCount: 1420,
    activeDiscussions: 38,
    description: 'Nơi trao đổi kinh nghiệm Spring Boot, NestJS, Docker, AWS và giải đáp đồ án chuyên ngành.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'g2',
    name: 'Cộng Đồng Thiết Kế UI/UX & Figma Master',
    category: 'THIẾT KẾ',
    membersCount: 890,
    activeDiscussions: 24,
    description: 'Chia sẻ template Figma, review portfolio và tổ chức các buổi critique đồ án thiết kế.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'g3',
    name: 'CLB Luyện Nói Tiếng Anh IELTS & Giao Tiếp',
    category: 'NGOẠI NGỮ',
    membersCount: 2150,
    activeDiscussions: 62,
    description: 'Phòng luyện nói hàng tuần, trao đổi phương pháp học từ vựng và tự tin thuyết trình.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'g4',
    name: 'Nhóm Giải Đề Toán Cao Cấp & Xác Suất Thống Kê',
    category: 'KHOA HỌC',
    membersCount: 1040,
    activeDiscussions: 45,
    description: 'Giải đáp các bài tập hóc búa, ôn luyện đề thi giữa kỳ và cuối kỳ cho sinh viên năm nhất.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400',
  },
];

export const TOP_CONTRIBUTORS: TopContributor[] = [
  {
    id: 'u1',
    name: 'Nguyễn Hoàng Sang',
    major: 'Kỹ thuật phần mềm',
    hoursShared: 48.5,
    trustScore: 98,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rank: 1,
  },
  {
    id: 'u2',
    name: 'Trần Minh Trí',
    major: 'Khoa học máy tính',
    hoursShared: 42.0,
    trustScore: 96,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rank: 2,
  },
  {
    id: 'u3',
    name: 'Lê Thu Hà',
    major: 'Kinh tế đối ngoại',
    hoursShared: 37.5,
    trustScore: 95,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rank: 3,
  },
];
