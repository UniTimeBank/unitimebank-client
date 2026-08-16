import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CalendarCheck,
  Wallet,
  MessageSquare,
} from 'lucide-react';

export const ManagementLayout: React.FC = () => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/manage/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Quản lý Lịch rảnh',
      path: '/manage/schedule',
      icon: Calendar,
    },
    {
      label: 'Quản lý Bài đăng',
      path: '/manage/posts',
      icon: FileText,
    },
    {
      label: 'Quản lý Booking',
      path: '/manage/bookings',
      icon: CalendarCheck,
    },
    {
      label: 'Ví Credit',
      path: '/manage/wallet',
      icon: Wallet,
    },
    {
      label: 'Tin nhắn',
      path: '/manage/messages',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEFT SIDEBAR (Sticky on desktop) */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <aside className="w-full lg:w-56 shrink-0 bg-white rounded-3xl p-3.5 border border-gray-100 shadow-xs lg:sticky lg:top-24">
        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary-100/70 text-primary-800 font-extrabold shadow-2xs'
                      : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50/50 font-semibold'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* RIGHT MAIN CONTENT AREA */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 w-full">
        <Outlet />
      </div>
    </div>
  );
};
