export interface ActiveSessionWidgetData {
  id: string;
  title: string;
  subtitle: string;
  type: 'video' | 'clock';
  color: 'teal' | 'blue';
}

export interface LedgerSummaryItem {
  id: string;
  title: string;
  time: string;
  amount: string;
  type: 'plus' | 'minus';
}

export const SAMPLE_ACTIVE_SESSIONS: ActiveSessionWidgetData[] = [
  {
    id: 's1',
    title: 'Ôn tập Lịch sử Thế giới',
    subtitle: 'Đang diễn ra • 14:02',
    type: 'video',
    color: 'teal',
  },
  {
    id: 's2',
    title: 'Sửa lỗi React Hooks',
    subtitle: 'Bắt đầu sau 45p',
    type: 'clock',
    color: 'blue',
  },
];

export const SAMPLE_LEDGER_TRANSACTIONS: LedgerSummaryItem[] = [
  {
    id: 'l1',
    title: 'Dạy: Sinh học Đại cương',
    time: 'Hôm nay, 11:30',
    amount: '+60p',
    type: 'plus',
  },
  {
    id: 'l2',
    title: 'Học: Sửa Luận văn',
    time: 'Hôm qua',
    amount: '-30p',
    type: 'minus',
  },
  {
    id: 'l3',
    title: 'Dạy: Lập trình Python',
    time: '24 Th10, 2023',
    amount: '+45p',
    type: 'plus',
  },
];

export interface TrendingExchangeItem {
  id: string;
  category: string;
  duration: string;
  title: string;
  description: string;
  mentorName: string;
  avatar: string;
  rating: number | string;
}

export const DEFAULT_TRENDING: TrendingExchangeItem[] = [
  {
    id: 't1',
    category: 'Lập trình',
    duration: '60 phút',
    title: 'Hướng dẫn xây dựng RESTful API với NestJS & MongoDB',
    description: 'Chia sẻ kinh nghiệm thiết kế kiến trúc chuẩn Clean Architecture, xử lý validation và auth JWT.',
    mentorName: 'Nguyễn Văn Hùng',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    rating: '4.9',
  },
  {
    id: 't2',
    category: 'Thiết kế',
    duration: '45 phút',
    title: 'Review Portfolio & Tư vấn CV ứng tuyển UI/UX Intern',
    description: 'Góp ý chi tiết về layout, typography, case study và cách trình bày dự án để gây ấn tượng với nhà tuyển dụng.',
    mentorName: 'Lê Thảo My',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    rating: '5.0',
  },
  {
    id: 't3',
    category: 'Ngoại ngữ',
    duration: '60 phút',
    title: 'Mock Interview Speaking IELTS & Sửa lỗi phát âm',
    description: 'Luyện tập các chủ đề Part 2, Part 3 thường gặp trong quý này, hướng dẫn mở rộng ý và từ vựng band 7.0+.',
    mentorName: 'Phạm Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120',
    rating: '4.8',
  },
];
