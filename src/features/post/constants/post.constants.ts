export const POST_CATEGORIES = [
  { label: 'Tất cả danh mục', value: 'All' },
  { label: 'Lập trình & CNTT', value: 'PROGRAMMING' },
  { label: 'Ngoại ngữ', value: 'LANGUAGE' },
  { label: 'Thiết kế & Đồ họa', value: 'DESIGN' },
  { label: 'Kỹ năng mềm', value: 'SOFT_SKILLS' },
  { label: 'Âm nhạc & Xử lý âm thanh', value: 'MUSIC' },
  { label: 'Thể thao & Sức khỏe', value: 'SPORTS' },
  { label: 'Kinh doanh & Tài chính', value: 'BUSINESS' },
  { label: 'Học thuật / Khác', value: 'OTHER' },
];

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  PROGRAMMING: 'Lập trình & CNTT',
  LANGUAGE: 'Ngoại ngữ',
  DESIGN: 'Thiết kế & Đồ họa',
  SOFT_SKILLS: 'Kỹ năng mềm',
  MUSIC: 'Âm nhạc & Xử lý âm thanh',
  SPORTS: 'Thể thao & Sức khỏe',
  BUSINESS: 'Kinh doanh & Tài chính',
  OTHER: 'Học thuật / Khác',
  // Legacy / fallback mappings
  STEM: 'Lập trình & CNTT',
  ARTS: 'Thiết kế & Đồ họa',
  HUMANITIES: 'Ngoại ngữ',
  ECONOMICS: 'Kinh doanh',
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
  { label: 'Trong 24 giờ', value: 'In 24 Hours' },
  { label: 'Trong 3 ngày', value: 'In 3 Days' },
  { label: 'Trong 7 ngày', value: 'In 7 Days' },
];
