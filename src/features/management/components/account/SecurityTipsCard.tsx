import React from 'react';
import { Sparkles } from 'lucide-react';

export const SecurityTipsCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-primary-50/70 to-emerald-50/50 rounded-3xl p-6 border border-primary-100/80 space-y-3">
      <h3 className="text-sm font-bold text-primary-950 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary-600" />
        Bảo vệ Tài khoản UniTime
      </h3>
      <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
        <li className="flex items-start gap-2">
          <span className="text-primary-600 font-bold">•</span>
          <span>Sử dụng mật khẩu có độ dài từ 8 ký tự trở lên kết hợp chữ hoa, chữ thường và chữ số.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary-600 font-bold">•</span>
          <span>Tuyệt đối không chia sẻ mật khẩu hoặc tài khoản của bạn để bảo vệ <strong>Số dư Giờ học (Time Credit)</strong>.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary-600 font-bold">•</span>
          <span>Đăng xuất khi sử dụng máy tính công cộng tại trường học hoặc thư viện.</span>
        </li>
      </ul>
    </div>
  );
};
