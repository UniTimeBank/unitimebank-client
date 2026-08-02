import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage, ChangePasswordModal } from '@/features/auth';
import { useAuth } from '@/features/auth/hooks';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { ROUTES } from './paths';

// Component trang chủ tạm thời (Dashboard)
const HomePage = () => {
  const { logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100 max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
        Chào mừng đến với UniTime Bank! 🎓
      </h1>
      <p className="text-gray-600 mb-6 leading-relaxed">
        Nền tảng trao đổi kỹ năng sinh viên dựa trên quỹ thời gian công bằng (1 phút học = 1 credit).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-primary-50 border border-primary-100">
          <div className="text-2xl font-bold text-primary-600 mb-1">120</div>
          <div className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
            CREDITS KHẢ DỤNG
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-2xl font-bold text-slate-800 mb-1">5</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            BUỔI HỌC ĐÃ HOÀN THÀNH
          </div>
        </div>

        <div className="p-5 rounded-xl bg-primary-50 border border-primary-100">
          <div className="text-2xl font-bold text-primary-600 mb-1">4.9 ★</div>
          <div className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
            ĐIỂM UY TÍN
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button className="px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm transition-all shadow-xs cursor-pointer">
          + Đăng bài trao đổi
        </button>
        <button className="px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all cursor-pointer">
          Khám phá lớp học
        </button>
        <button
          onClick={() => setShowChangePassword(true)}
          className="px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all cursor-pointer"
        >
          🔑 Đổi mật khẩu
        </button>
        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-full border border-red-200 hover:bg-red-50 text-red-600 font-medium text-sm transition-all cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>

      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Route công khai - Auth (Chỉ dùng /login và /register) */}
      <Route
        path={ROUTES.AUTH.LOGIN}
        element={
          <PublicRoute>
            <AuthPage initialView="login" />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.REGISTER}
        element={
          <PublicRoute>
            <AuthPage initialView="register" />
          </PublicRoute>
        }
      />
      <Route path="/auth" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />

      {/* Route bảo vệ - Yêu cầu đăng nhập */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Wildcard 404 Route */}
      <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};