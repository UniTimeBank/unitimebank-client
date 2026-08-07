import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-gray-50 border-t border-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">UniTime Bank</h3>
          <p className="max-w-md text-gray-500">
            © 2024 UniTime Bank. Nền tảng trao đổi kỹ năng sinh viên dựa trên quỹ thời gian công bằng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-medium text-gray-600">
          <a href="#" className="hover:text-emerald-600 transition-colors">Về chúng tôi</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Trung tâm trợ giúp</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Quy tắc cộng đồng</a>
        </div>
      </div>
    </footer>
  );
};
