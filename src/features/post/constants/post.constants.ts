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

export const DEFAULT_POST_COVER = '/images/categories/laptrinh/laptrinh1.webp';

export const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  PROGRAMMING: '/images/categories/laptrinh/laptrinh1.webp',
  STEM: '/images/categories/laptrinh/laptrinh1.webp',
  LANGUAGE: '/images/categories/ngoaingu/ngoaingu1.webp',
  HUMANITIES: '/images/categories/ngoaingu/ngoaingu1.webp',
  DESIGN: '/images/categories/thietke/thietke1.webp',
  ARTS: '/images/categories/thietke/thietke1.webp',
  ACADEMIC: '/images/categories/hocthuat/hocthuat1.webp',
  BUSINESS: '/images/categories/kinhdoanh/kinhdoanh1.webp',
  ECONOMICS: '/images/categories/kinhdoanh/kinhdoanh1.webp',
  SOFT_SKILLS: '/images/categories/kynangmem/kynangmem1.webp',
  MUSIC: '/images/categories/amnhac/amnhac1.webp',
  SPORTS: '/images/categories/thethao/thethao1.webp',
  OTHER: '/images/categories/khac/khac1.webp',
};

export const CATEGORY_PRESET_IMAGES: Record<string, string[]> = {
  PROGRAMMING: [
    '/images/categories/laptrinh/laptrinh1.webp',
    '/images/categories/laptrinh/laptrinh2.webp',
    '/images/categories/laptrinh/laptrinh3.webp',
    '/images/categories/laptrinh/laptrinh4.webp',
  ],
  LANGUAGE: [
    '/images/categories/ngoaingu/ngoaingu1.webp',
    '/images/categories/ngoaingu/ngoaingu2.webp',
    '/images/categories/ngoaingu/ngoaingu3.webp',
    '/images/categories/ngoaingu/ngoaingu4.webp',
  ],
  DESIGN: [
    '/images/categories/thietke/thietke1.webp',
    '/images/categories/thietke/thietke2.webp',
    '/images/categories/thietke/thietke3.webp',
    '/images/categories/thietke/thietke4.webp',
  ],
  ACADEMIC: [
    '/images/categories/hocthuat/hocthuat1.webp',
    '/images/categories/hocthuat/hocthuat2.webp',
    '/images/categories/hocthuat/hocthuat3.webp',
    '/images/categories/hocthuat/hocthuat4.webp',
  ],
  BUSINESS: [
    '/images/categories/kinhdoanh/kinhdoanh1.webp',
    '/images/categories/kinhdoanh/kinhdoanh2.webp',
    '/images/categories/kinhdoanh/kinhdoanh3.webp',
    '/images/categories/kinhdoanh/kinhdoanh4.webp',
  ],
  SOFT_SKILLS: [
    '/images/categories/kynangmem/kynangmem1.webp',
    '/images/categories/kynangmem/kynangmem2.webp',
    '/images/categories/kynangmem/kynangmem3.webp',
    '/images/categories/kynangmem/kynangmem4.webp',
  ],
  MUSIC: [
    '/images/categories/amnhac/amnhac1.webp',
    '/images/categories/amnhac/amnhac2.webp',
    '/images/categories/amnhac/amnhac3.webp',
    '/images/categories/amnhac/amnhac4.webp',
  ],
  SPORTS: [
    '/images/categories/thethao/thethao1.webp',
    '/images/categories/thethao/thethao2.webp',
    '/images/categories/thethao/thethao3.webp',
    '/images/categories/thethao/thethao4.webp',
  ],
  OTHER: [
    '/images/categories/khac/khac1.webp',
    '/images/categories/khac/khac2.webp',
    '/images/categories/khac/khac3.webp',
    '/images/categories/khac/khac4.webp',
  ],
};

export const PRESET_COVER_IMAGES = [
  '/images/categories/laptrinh/laptrinh1.webp',
  '/images/categories/ngoaingu/ngoaingu1.webp',
  '/images/categories/thietke/thietke1.webp',
  '/images/categories/kinhdoanh/kinhdoanh1.webp',
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

