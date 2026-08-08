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
