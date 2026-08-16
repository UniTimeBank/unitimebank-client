import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Clock, Gift, Bell } from 'lucide-react';
import { NAV_LINKS } from '@/shared/config';
import { UserRoleDropdown } from './UserRoleDropdown';

interface HeaderProps {
  userCredits?: number;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  trustScore?: number;
  hasUncompletedTasks?: boolean;
  onOpenCreditTasks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userCredits = 0,
  userName = 'Thành viên UniTime',
  userEmail,
  avatarUrl,
  trustScore = 100,
  hasUncompletedTasks = false,
  onOpenCreditTasks,
}) => {
  const location = useLocation();
  const isManagePage = location.pathname.startsWith('/manage');

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-gray-100 px-4 sm:px-6 py-3 shadow-2xs">
      <div
        className={`mx-auto flex items-center justify-between gap-3 md:gap-6 ${
          isManagePage ? 'max-w-[1536px]' : 'max-w-7xl'
        }`}
      >
        {/* Brand Logo & Nav */}
        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <Link to="/explore" className="flex items-center gap-2.5 shrink-0">
            <span className="text-xl font-black tracking-tight text-gray-900 whitespace-nowrap">
              UniTime<span className="text-primary-500">Bank</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-semibold">
            {NAV_LINKS.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors py-1 border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'text-primary-600 border-primary-500 font-extrabold'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search Bar & User Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          {/* Search bar */}
          <div className="relative hidden xl:block w-64 lg:w-72 shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm kỹ năng hoặc sinh viên..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Credits Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 font-extrabold text-xs rounded-full border border-primary-100 shadow-2xs whitespace-nowrap shrink-0">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>{userCredits} Credit</span>
          </div>

          {/* Credit Tasks Gift Icon Button */}
          {onOpenCreditTasks && (
            <button
              onClick={onOpenCreditTasks}
              title="Nhiệm vụ nhận Credit"
              className="relative p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer shrink-0"
            >
              <Gift className="w-4.5 h-4.5 text-gray-600 hover:text-emerald-600" />
              {hasUncompletedTasks && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>
          )}

          {/* Notification Bell */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Role Switcher & Profile Dropdown */}
          <UserRoleDropdown
            userName={userName}
            userEmail={userEmail}
            avatarUrl={avatarUrl}
            userCredits={userCredits}
            trustScore={trustScore}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};
