import type { ReportCategory } from '../types';

export interface ReportCategoryOption {
  id: ReportCategory;
  label: string;
  desc: string;
}

export const REPORT_CATEGORIES: ReportCategoryOption[] = [
  {
    id: 'AFK_ABUSE',
    label: 'Vắng mặt / Không đến lớp',
    desc: 'Người dùng không vào phòng học hoặc rời phòng giữa chừng không lý do',
  },
  {
    id: 'TOXIC_LANGUAGE',
    label: 'Lời nói / Thái độ xúc phạm',
    desc: 'Có hành vi thiếu tôn trọng, quấy rối hoặc ngôn từ thù địch',
  },
  {
    id: 'FRAUD',
    label: 'Gian lận Credit / Lừa đảo',
    desc: 'Yêu cầu thanh toán tiền mặt ngoài hệ thống hoặc lừa đảo thời gian',
  },
  {
    id: 'INAPPROPRIATE_CONTENT',
    label: 'Nội dung không phù hợp',
    desc: 'Chia sẻ tài liệu vi phạm bản quyền hoặc hình ảnh phản cảm',
  },
  {
    id: 'SPAM',
    label: 'Spam / Tin nhắn rác',
    desc: 'Gửi quảng cáo hoặc spam tin nhắn liên tục',
  },
  {
    id: 'OTHER',
    label: 'Lý do khác',
    desc: 'Các vấn đề phát sinh khác trong quá trình trao đổi',
  },
];
