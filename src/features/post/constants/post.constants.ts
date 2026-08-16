export const POST_CATEGORIES = [
  { label: 'Tất cả danh mục', value: 'All' },
  { label: 'Lập trình', value: 'PROGRAMMING' },
  { label: 'Ngoại ngữ', value: 'LANGUAGE' },
  { label: 'Thiết kế', value: 'DESIGN' },
  { label: 'Học thuật', value: 'ACADEMIC' },
  { label: 'Kinh doanh', value: 'BUSINESS' },
  { label: 'Kỹ năng mềm', value: 'SOFT_SKILLS' },
  { label: 'Âm nhạc', value: 'MUSIC' },
  { label: 'Thể thao', value: 'SPORTS' },
  { label: 'Khác', value: 'OTHER' },
];

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  PROGRAMMING: 'Lập trình',
  LANGUAGE: 'Ngoại ngữ',
  DESIGN: 'Thiết kế',
  ACADEMIC: 'Học thuật',
  BUSINESS: 'Kinh doanh',
  SOFT_SKILLS: 'Kỹ năng mềm',
  MUSIC: 'Âm nhạc',
  SPORTS: 'Thể thao',
  OTHER: 'Khác',
  // Legacy / fallback mappings
  STEM: 'Lập trình',
  ARTS: 'Thiết kế',
  HUMANITIES: 'Ngoại ngữ',
  ECONOMICS: 'Kinh doanh',
};

export const DEFAULT_POST_COVER =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600';

export const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  PROGRAMMING:
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  STEM:
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  LANGUAGE:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
  HUMANITIES:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
  DESIGN:
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
  ARTS:
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
  ACADEMIC:
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
  BUSINESS:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
  ECONOMICS:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
  SOFT_SKILLS:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
  MUSIC:
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
  SPORTS:
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=600',
  OTHER:
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
};

export const PRESET_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
];

export const POST_SORT_OPTIONS = [
  { label: 'Credit: Cao đến thấp', value: 'High to Low' },
  { label: 'Credit: Thấp đến cao', value: 'Low to High' },
  { label: 'Mới nhất', value: 'Newest' },
];

export const URGENCY_OPTIONS = [
  { label: 'Độ khẩn: Tất cả', value: 'Any' },
  { label: '⚡ Cần gấp', value: 'Urgent' },
  { label: 'Tiêu chuẩn', value: 'Standard' },
];

export const TIMELINE_OPTIONS = [
  { label: 'Trong 24 giờ', value: 'Trong 24 giờ' },
  { label: 'Trong 3 ngày', value: 'Trong 3 ngày' },
  { label: 'Trong 7 ngày', value: 'Trong 7 ngày' },
];

