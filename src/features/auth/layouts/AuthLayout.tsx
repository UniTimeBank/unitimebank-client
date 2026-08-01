import type { ReactNode } from 'react';
import studentsHero from '@/assets/images/students_hero.png';
import logoGreen from '@/assets/images/Logo.png';
import logoWhite from '@/assets/images/Logo_white.png';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex flex-col lg:flex-row h-screen max-h-screen w-full bg-slate-50/70 font-sans overflow-hidden">
      {/* Left Side - Split Hero Background & Glassmorphism Cards */}
      <div className="w-full lg:w-1/2 h-full relative hidden lg:flex flex-col justify-between p-8 xl:p-12 overflow-hidden select-none">
        {/* Background Image */}
        <img
          src={studentsHero}
          alt="Sinh viên cùng học tập"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20 z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent z-0" />

        {/* Top Header Logo (White) & Tag Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="UniTime Bank Logo" className="h-8 xl:h-9 w-auto object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">
              UniTime Bank
            </span>
          </div>
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-primary-500 text-white text-[10px] xl:text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-xs">
            TRAO ĐỔI TRI THỨC
          </span>
        </div>

        {/* Bottom Main Content & Glassmorphism Stats */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-3 drop-shadow-xs">
            Nâng Tầm Tri Thức Qua Thời Gian.
          </h1>
          <p className="text-slate-200 text-xs xl:text-sm leading-relaxed max-w-lg font-normal mb-6 opacity-95">
            Tham gia cộng đồng chia sẻ kiến thức công bằng nhất. Tại UniTime Bank, một giờ chuyên môn của bạn có giá trị bằng một giờ của bất kỳ ai khác.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 xl:gap-4">
            <div className="backdrop-blur-md bg-white/15 border border-white/20 rounded-xl p-4 shadow-lg transition-all hover:bg-white/20">
              <div className="text-2xl xl:text-3xl font-black text-primary-300 tracking-tight">15k+</div>
              <div className="text-[10px] xl:text-[11px] font-semibold text-white/80 tracking-wider uppercase mt-0.5">
                NGƯỜI HỌC TÍCH CỰC
              </div>
            </div>

            <div className="backdrop-blur-md bg-white/15 border border-white/20 rounded-xl p-4 shadow-lg transition-all hover:bg-white/20">
              <div className="text-2xl xl:text-3xl font-black text-primary-300 tracking-tight">50k</div>
              <div className="text-[10px] xl:text-[11px] font-semibold text-white/80 tracking-wider uppercase mt-0.5">
                GIỜ ĐÃ TRAO ĐỔI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Container & Header Logo */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-4 sm:p-6 xl:p-10 overflow-y-auto lg:overflow-hidden">
        {/* Mobile Header Logo (Hidden on Desktop) */}
        <div className="flex lg:hidden items-center gap-3 mb-3">
          <img src={logoGreen} alt="UniTime Bank Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-extrabold text-primary-500 tracking-tight">
            UniTime Bank
          </span>
        </div>

        {/* Dynamic Form Content Wrapper - Stable Card Container */}
        <div className="w-full max-w-md mx-auto my-auto">
          <div className="w-full bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 rounded-3xl p-6 sm:p-7 min-h-[570px] sm:min-h-[580px] flex flex-col justify-between">
            {children}
          </div>
        </div>

        {/* Bottom Terms Footer */}
        <div className="text-center text-[11px] text-gray-400 leading-relaxed pt-2">
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <a href="#" className="underline hover:text-gray-600 transition-colors font-medium">
            Điều khoản dịch vụ
          </a>{' '}
          và{' '}
          <a href="#" className="underline hover:text-gray-600 transition-colors font-medium">
            Chính sách bảo mật
          </a>{' '}
          của UniTime Bank.
        </div>
      </div>
    </div>
  );
};
