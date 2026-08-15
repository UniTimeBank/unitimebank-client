import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, ReceiptText, LogOut } from 'lucide-react';
import { useActiveRole } from '@/shared/hooks/useActiveRole';
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
  userCredits = 120,
  trustScore = 100,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { activeRole, isMentor, switchRole } = useActiveRole();
  const displayAvatar = avatarUrl || LogoImage;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
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

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative shrink-0"
    >
      {/* Avatar Button Tinh Gọn (Không icon dính góc) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer select-none outline-none group"
      >
        <img
          src={displayAvatar}
          alt={userName}
          className={`w-8.5 h-8.5 rounded-full object-cover ring-1 transition-all ${isOpen
            ? 'ring-slate-900 shadow-xs'
            : 'ring-slate-200 group-hover:ring-slate-400'
            }`}
        />
      </button>

      {/* Menu Dropdown Clean & Minimal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-slate-800">
          {/* User Info Header */}
          <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-100 pb-3">
            <img
              src={displayAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 truncate leading-snug">
                {userName}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {userEmail || 'Sinh viên UniTime'}
              </p>

            </div>
          </div>

          {/* Clean Role Switcher (Segmented Control Tinh Gọn) */}
          <div className="py-3 px-1 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Vai trò hiện tại
              </span>

            </div>

            {/* Segmented Buttons */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => switchRole('LEARNER')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${!isMentor
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Người học
              </button>

              <button
                type="button"
                onClick={() => switchRole('MENTOR')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${isMentor
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Người dạy
              </button>
            </div>


          </div>

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
              to={isMentor ? '/profile' : '/explore'}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>{isMentor ? 'Quản lý lịch rảnh của tôi' : 'Khám phá bài học mới'}</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <ReceiptText className="w-4 h-4 text-slate-400 stroke-[1.75]" />
              <span>Sổ cái & Lịch sử Credit</span>
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
