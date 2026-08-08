export interface NavLinkItem {
  label: string;
  path: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Khám phá', path: '/explore' },
  { label: 'Yêu cầu học', path: '/requests' },
  { label: 'Sổ cái Credit', path: '/profile' },
  { label: 'Cộng đồng', path: '/community' },
];
