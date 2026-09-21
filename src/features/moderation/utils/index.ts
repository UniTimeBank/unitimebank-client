import type { ReportCategory } from '../types';

export interface ReportCategoryOption {
  id: ReportCategory;
  label: string;
  desc: string;
}

// Danh mục vi phạm khi báo cáo Học viên (Học viên gây rối, ồn ào, treo máy, ...)
export const LEARNER_REPORT_CATEGORIES: ReportCategoryOption[] = [
  {
    id: 'TOXIC_LANGUAGE',
    label: 'Gây ồn ào / Thái độ xúc phạm',
    desc: 'Bật mic gây ồn, ngắt lời, dùng ngôn từ thô lỗ hoặc quấy rối trong phòng',
  },
  {
    id: 'SPAM',
    label: 'Phá rối / Spam liên tục',
    desc: 'Spam tin nhắn, gửi liên kết rác hoặc vẽ bậy phá hoại bảng chia sẻ',
  },
  {
    id: 'AFK_ABUSE',
    label: 'Treo máy (AFK) / Bỏ lớp',
    desc: 'Treo máy không tham gia tương tác hoặc rời phòng giữa chừng không lý do',
  },
  {
    id: 'INAPPROPRIATE_CONTENT',
    label: 'Nội dung phản cảm',
    desc: 'Bật camera hoặc chia sẻ hình ảnh, tài liệu phản cảm, không phù hợp',
  },
  {
    id: 'FRAUD',
    label: 'Gian lận Credit',
    desc: 'Gian lận thời gian học hoặc lừa đảo giao dịch ngoài hệ thống',
  },
  {
    id: 'OTHER',
    label: 'Lý do khác',
    desc: 'Các hành vi vi phạm khác ảnh hưởng đến buổi học và thành viên',
  },
];

// Danh mục vi phạm khi báo cáo Người hướng dẫn / Giảng viên (Vắng mặt, gian lận, ...)
export const MENTOR_REPORT_CATEGORIES: ReportCategoryOption[] = [
  {
    id: 'AFK_ABUSE',
    label: 'Vắng mặt / Không đến lớp',
    desc: 'Người hướng dẫn không vào phòng học hoặc bỏ lớp giữa chừng không lý do',
  },
  {
    id: 'FRAUD',
    label: 'Gian lận Credit / Lừa đảo',
    desc: 'Yêu cầu thanh toán tiền mặt ngoài hệ thống hoặc gian lận thời gian dạy',
  },
  {
    id: 'TOXIC_LANGUAGE',
    label: 'Thái độ xấu / Xúc phạm',
    desc: 'Có lời nói thiếu tôn trọng, quấy rối hoặc thái độ xúc phạm học viên',
  },
  {
    id: 'INAPPROPRIATE_CONTENT',
    label: 'Nội dung không phù hợp / Sai lệch',
    desc: 'Tài liệu phản cảm, vi phạm bản quyền hoặc hướng dẫn sai lệch nghiêm trọng',
  },
  {
    id: 'SPAM',
    label: 'Spam / Dụ dỗ khóa học ngoài',
    desc: 'Spam tin nhắn rác hoặc lôi kéo học viên mua khóa học bên ngoài hệ thống',
  },
  {
    id: 'OTHER',
    label: 'Lý do khác',
    desc: 'Các vấn đề phát sinh khác trong quá trình trao đổi',
  },
];

// Danh mục mặc định (tương thích ngược)
export const REPORT_CATEGORIES: ReportCategoryOption[] = MENTOR_REPORT_CATEGORIES;

/**
 * Lấy danh mục báo cáo vi phạm phù hợp theo vai trò của người bị báo cáo
 */
export const getReportCategoriesByRole = (
  targetRole?: 'LEARNER' | 'MENTOR' | string,
): ReportCategoryOption[] => {
  if (targetRole === 'LEARNER') {
    return LEARNER_REPORT_CATEGORIES;
  }
  return MENTOR_REPORT_CATEGORIES;
};
