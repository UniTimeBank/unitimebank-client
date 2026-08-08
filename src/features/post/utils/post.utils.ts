export interface CategoryBadgeInfo {
  label: string;
  style: string;
}

export const getCategoryBadge = (category?: string): CategoryBadgeInfo => {
  switch (category?.toUpperCase()) {
    case 'STEM':
    case 'PROGRAMMING':
    case 'LẬP TRÌNH':
      return { label: 'LẬP TRÌNH', style: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'ARTS':
    case 'DESIGN':
    case 'THIẾT KẾ':
      return { label: 'THIẾT KẾ', style: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'HUMANITIES':
    case 'LANGUAGE':
    case 'NGOẠI NGỮ':
      return { label: 'NGOẠI NGỮ', style: 'bg-gray-100 text-gray-700 border-gray-200' };
    case 'ECONOMICS':
    case 'BUSINESS':
    case 'KINH TẾ':
      return { label: 'KINH TẾ', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'ACADEMIC':
    case 'HỌC THUẬT':
    default:
      return { label: 'HỌC THUẬT', style: 'bg-primary-50 text-primary-700 border-primary-200' };
  }
};
