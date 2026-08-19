import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Calendar, ReceiptText, LogOut, CalendarCheck, LayoutDashboard, FileText } from 'lucide-react';
import LogoImage from '@/assets/images/Logo.png';

interface UserRoleDropdownProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  userCredits?: number;
  trustScore?: number;
  onLogout: () => void;
}

export const UserRoleDropdown: React.FC<UserRoleDropdownProps> = ({
  userName = 'Thành viên UniTime',
  userEmail,
  avatarUrl,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
    navigate('/profile');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstLetter = userName?.trim().charAt(0)?.toUpperCase() || 'U';

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative shrink-0"
    >
      {/* Avatar Button Tinh Gọn: Click trực tiếp chuyển đến /profile */}
      <button
        type="button"
        onClick={handleAvatarClick}
        title="Trang cá nhân & Hồ sơ"
        className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer select-none outline-none group"
      >
        {avatarUrl && !imageError ? (
          <img
            src={avatarUrl}
            alt={userName}
            onError={() => setImageError(true)}
            className={`w-8.5 h-8.5 rounded-full object-cover ring-1 transition-all ${
              isOpen
                ? 'ring-slate-900 shadow-xs'
                : 'ring-slate-200 group-hover:ring-slate-400'
            }`}
          />
        ) : (
          <div
            className={`w-8.5 h-8.5 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center ring-1 transition-all shrink-0 ${
              isOpen
                ? 'ring-slate-900 shadow-xs'
                : 'ring-primary-200 group-hover:ring-primary-400'
            }`}
          >
            {firstLetter}
          </div>
        )}
      </button>

      {/* Menu Dropdown Clean & Minimal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-slate-800">
          {/* User Info Header: Click vào cũng sang /profile */}
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-2 py-2 border-b border-slate-100 pb-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {avatarUrl && !imageError ? (
              <img
                src={avatarUrl}
                alt={userName}
                onError={() => setImageError(true)}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center ring-1 ring-primary-200 shrink-0">
                {firstLetter}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 truncate leading-snug">
                {userName}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {userEmail || 'Sinh viên UniTime'}
              </p>
            </div>
          </Link>

          {/* Quick Menu Links */}
          <div className="pt-2 space-y-0.5">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>Trang cá nhân & Hồ sơ</span>
            </Link>

            <Link
              to="/manage/posts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>Quản lý Bài đăng</span>
            </Link>

            <Link
              to="/manage/bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <CalendarCheck className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>Quản lý Booking</span>
            </Link>

            <Link
              to="/manage/schedule"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>Quản lý Lịch rảnh</span>
            </Link>

            <Link
              to="/manage/wallet"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <ReceiptText className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>Sổ cái & Ví Credit</span>
            </Link>

            <Link
              to="/manage/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>Dashboard Tổng quan</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-red-500 stroke-[1.75]" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
