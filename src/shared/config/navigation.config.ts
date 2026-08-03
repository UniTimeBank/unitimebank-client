export interface NavLinkItem {
  label: string;
  path: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Sàn giao dịch', path: '/marketplace' },
  { label: 'Lớp học', path: '/classes' },
  { label: 'Sổ cái Credit', path: '/ledger' },
];
