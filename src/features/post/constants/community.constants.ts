import type { GroupPostTag } from '../types';

export const COMMUNITY_CATEGORIES = [
  'Tất cả',
  'Công nghệ thông tin',
  'Toán học & Giải tích',
  'Ngoại ngữ & IELTS',
  'Kinh tế & Marketing',
  'Thiết kế & Đồ họa',
  'Khoa học cơ bản',
  'Đời sống sinh viên',
] as const;

export const CREATE_GROUP_CATEGORIES = [
  'Công nghệ thông tin',
  'Toán học & Giải tích',
  'Ngoại ngữ & IELTS',
  'Kinh tế & Marketing',
  'Thiết kế & Đồ họa',
  'Khoa học cơ bản',
  'Đời sống sinh viên',
  'Khác',
] as const;

export const PRESET_GROUP_COVERS = [
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

export const DEFAULT_GROUP_RULES = [
  'Tôn trọng và lịch sự với tất cả thành viên trong nhóm.',
  'Chia sẻ kiến thức, tài liệu chính xác và có nguồn gốc rõ ràng.',
  'Không spam hoặc đăng nội dung không liên quan đến chủ đề nhóm.',
];

export const GROUP_POST_TAG_CONFIG: Record<
  GroupPostTag,
  { label: string; bg: string; text: string; border: string; iconName: string }
> = {
  QA: {
    label: 'Hỏi đáp bài tập',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    iconName: 'HelpCircle',
  },
  DOCUMENT: {
    label: 'Chia sẻ tài liệu',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    iconName: 'FolderDown',
  },
  STUDY_BUDDY: {
    label: 'Tìm bạn cùng học',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    iconName: 'Users',
  },
  GENERAL: {
    label: 'Thảo luận chung',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    iconName: 'BookOpen',
  },
};
