import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { ROUTES } from '@/routes/paths';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerifyOtpForm } from './VerifyOtpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ForgotOtpForm } from './ForgotOtpForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { useAuth } from '../hooks';

export type AuthView = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'forgot-otp' | 'reset-password';

interface AuthTabsProps {
  initialView?: AuthView;
}

const GoogleLoginButton = () => {
  const { googleLogin, isLoading } = useAuth();

  const handleGoogleSuccess = async (tokenResponse: any) => {
    const token = tokenResponse.access_token || tokenResponse.credential;
    if (!token) return;
    const result = await googleLogin(token);
    if (result.success && result.data) {
      if (result.data.isNewUser) {
        sessionStorage.setItem('prompt_set_password', 'true');
      }
      window.location.href = '/';
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (err) => console.error('Lỗi đăng nhập Google:', err),
  });

  return (
    <button
      type="button"
      onClick={() => loginWithGoogle()}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs hover:shadow-sm disabled:opacity-50"
    >
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
      <span>{isLoading ? 'Đang xác thực Google...' : 'Tiếp tục với Google'}</span>
    </button>
  );
};

export const AuthTabsContent = ({ initialView = 'login' }: AuthTabsProps) => {
  const navigate = useNavigate();
  const { pendingEmail, forgotPassword } = useAuth();
  const [view, setView] = useState<AuthView>(pendingEmail ? 'verify-otp' : initialView);
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (!pendingEmail && (view === 'verify-otp')) {
      setView(initialView);
    }
  }, [initialView, pendingEmail, view]);

  const handleTabChange = (targetView: AuthView) => {
    setView(targetView);
    if (targetView === 'login') {
      navigate(ROUTES.AUTH.LOGIN);
    } else if (targetView === 'register') {
      navigate(ROUTES.AUTH.REGISTER);
    }
  };

  // Hiển thị header cho từng view
  const getHeadings = () => {
    switch (view) {
      case 'login':
        return { title: 'Chào mừng trở lại', desc: 'Nhập thông tin tài khoản của bạn để truy cập sổ nợ thời gian.' };
      case 'register':
        return { title: 'Tạo tài khoản mới', desc: 'Nhập địa chỉ Gmail của bạn để tham gia ngân hàng thời gian.' };
      case 'verify-otp':
        return { title: 'Xác thực tài khoản', desc: 'Nhập mã OTP 6 chữ số đã được gửi đến Gmail của bạn.' };
      case 'forgot-password':
        return { title: 'Quên mật khẩu?', desc: '' };
      case 'forgot-otp':
        return { title: 'Xác thực OTP', desc: '' };
      case 'reset-password':
        return { title: 'Đặt mật khẩu mới', desc: '' };
      default:
        return { title: '', desc: '' };
    }
  };

  const headings = getHeadings();

  return (
    <div className="w-full flex flex-col justify-center space-y-4">
      {/* Segmented Control Tab Bar - chỉ hiện ở login/register */}
      {(view === 'login' || view === 'register') && (
        <div className="flex bg-slate-100/90 p-1.5 rounded-2xl mb-1 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              view === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-gray-500 hover:text-slate-800 font-semibold'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              view === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-gray-500 hover:text-slate-800 font-semibold'
            }`}
          >
            Đăng ký
          </button>
        </div>
      )}

      {/* Headings */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          {headings.title}
        </h1>
        {headings.desc && (
          <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
            {headings.desc}
          </p>
        )}
      </div>

      {/* Active Form */}
      {view === 'login' && (
        <LoginForm
          onSwitchToRegister={() => handleTabChange('register')}
          onSwitchToVerifyOtp={() => setView('forgot-password')}
        />
      )}

      {view === 'register' && (
        <RegisterForm
          onSwitchToLogin={() => handleTabChange('login')}
          onRegisterSuccess={() => setView('verify-otp')}
        />
      )}

      {view === 'verify-otp' && (
        <VerifyOtpForm
          email={pendingEmail || ''}
          onBack={() => handleTabChange('login')}
          onSuccess={() => { window.location.href = '/'; }}
        />
      )}

      {view === 'forgot-password' && (
        <ForgotPasswordForm
          onBack={() => setView('login')}
          onSuccess={(email) => {
            setResetEmail(email);
            setView('forgot-otp');
          }}
        />
      )}

      {view === 'forgot-otp' && (
        <ForgotOtpForm
          email={resetEmail}
          onBack={() => setView('forgot-password')}
          onResend={() => forgotPassword(resetEmail)}
          onSuccess={(code) => {
            setOtpCode(code);
            setView('reset-password');
          }}
        />
      )}

      {view === 'reset-password' && (
        <ResetPasswordForm
          email={resetEmail}
          code={otpCode}
          onBack={() => setView('forgot-otp')}
          onSuccess={() => {
            setView('login');
            navigate(ROUTES.AUTH.LOGIN);
          }}
        />
      )}

      {/* Social Login Section - chỉ hiện ở login/register */}
      {(view === 'login' || view === 'register') && (
        <div className="pt-1">
          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              HOẶC ĐĂNG NHẬP VỚI
            </span>
          </div>
          <GoogleLoginButton />
        </div>
      )}
    </div>
  );
};

export const AuthTabs = (props: AuthTabsProps) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1049281920391-mock-unitimebank-client-id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthTabsContent {...props} />
    </GoogleOAuthProvider>
  );
};