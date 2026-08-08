export const POST_CATEGORIES = [
  { label: 'Tất cả danh mục', value: 'All' },
  { label: 'Lập trình & CNTT', value: 'STEM' },
  { label: 'Thiết kế & Đồ họa', value: 'ARTS' },
  { label: 'Ngoại ngữ & Xã hội', value: 'HUMANITIES' },
  { label: 'Kinh tế & Quản trị', value: 'ECONOMICS' },
];

export const DIFFICULTY_LEVELS = [
  { label: 'Cơ bản', value: 'Intro' },
  { label: 'Trung bình', value: 'Mid' },
  { label: 'Nâng cao', value: 'Expert' },
] as const;

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
