export interface NavLinkItem {
  label: string;
  path: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Khám phá', path: '/explore' },
  { label: 'Đăng bài', path: '/requests' },
  { label: 'Quản lý', path: '/manage/bookings' },
  { label: 'Cộng đồng', path: '/community' },
];


