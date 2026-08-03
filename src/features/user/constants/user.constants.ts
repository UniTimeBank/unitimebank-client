import type { SkillCategoryEnum } from '../types/user-skill.type.ts';

export const SKILL_CATEGORIES: { label: string; value: SkillCategoryEnum }[] = [
  { label: 'Lập trình & CNTT', value: 'PROGRAMMING' },
  { label: 'Ngoại ngữ & Ngôn ngữ', value: 'LANGUAGE' },
  { label: 'Thiết kế & UI/UX', value: 'DESIGN' },
  { label: 'Kỹ năng mềm & Giao tiếp', value: 'SOFT_SKILLS' },
  { label: 'Âm nhạc & Nghệ thuật', value: 'MUSIC' },
  { label: 'Thể thao & Sức khỏe', value: 'SPORTS' },
  { label: 'Kinh doanh & Quản trị', value: 'BUSINESS' },
  { label: 'Khác', value: 'OTHER' },
];

export const TRUST_SCORE_TIERS = {
  EXCELLENT: { min: 90, label: 'XUẤT SẮC', color: 'emerald' },
  GOOD: { min: 70, label: 'TỐT', color: 'blue' },
  AVERAGE: { min: 50, label: 'TRUNG BÌNH', color: 'amber' },
  WARNING: { min: 20, label: 'CẢNH BÁO', color: 'orange' },
  LOCKED: { min: 0, label: 'BỊ KHÓA', color: 'red' },
};
