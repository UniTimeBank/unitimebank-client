import React from 'react';
import { KeyRound, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useAccountSecurity } from '../hooks';
import {
  ChangePasswordForm,
  SetPasswordForm,
  LinkedAuthMethodsCard,
  ActiveSessionCard,
  SecurityTipsCard,
} from '../components/account';

export const AccountSecurityPage: React.FC = () => {
  const {
    // Password state
    hasPassword,

    // Change Password Form
    oldPassword,
    setOldPassword,
    newPasswordChange,
    setNewPasswordChange,
    confirmPasswordChange,
    setConfirmPasswordChange,
    changeErrors,
    setChangeErrors,
    changeSuccessMessage,
    handleChangePassword,

    // Set Password Form
    newPasswordSet,
    setNewPasswordSet,
    confirmPasswordSet,
    setConfirmPasswordSet,
    setErrors,
    setSetErrors,
    setSuccessMessage,
    handleSetPassword,

    // General Auth
    isLoading,
    logout,
  } = useAccountSecurity();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative space-y-6 animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER BAR */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            <span>Quản lý Tài khoản & Bảo mật</span>
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý thông tin đăng nhập, mật khẩu cá nhân và kiểm soát an toàn tài khoản UniTime.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN CONTENT GRID */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Password Management Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
            {/* Header Title depending on whether user already has a password */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                {hasPassword ? (
                  <>
                    <Lock className="w-5 h-5 text-primary-600" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Đổi Mật khẩu
                    </h3>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Thiết lập Mật khẩu mới
                    </h3>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {hasPassword
                  ? 'Để bảo mật tài khoản, mật khẩu mới phải khác mật khẩu hiện tại và có ít nhất 8 ký tự.'
                  : 'Tài khoản đăng nhập bằng Google chưa có mật khẩu. Thiết lập mật khẩu để có thể đăng nhập bằng Email & Mật khẩu trên mọi thiết bị.'}
              </p>
            </div>

            {/* If account already has a password -> Show Change Password Form */}
            {hasPassword ? (
              <ChangePasswordForm
                oldPassword={oldPassword}
                setOldPassword={setOldPassword}
                newPassword={newPasswordChange}
                setNewPassword={setNewPasswordChange}
                confirmPassword={confirmPasswordChange}
                setConfirmPassword={setConfirmPasswordChange}
                errors={changeErrors}
                setErrors={setChangeErrors}
                successMessage={changeSuccessMessage}
                onSubmit={handleChangePassword}
                isLoading={isLoading}
              />
            ) : (
              /* If account has NO password (Google Login) -> Show Set Password Form */
              <SetPasswordForm
                newPassword={newPasswordSet}
                setNewPassword={setNewPasswordSet}
                confirmPassword={confirmPasswordSet}
                setConfirmPassword={setConfirmPasswordSet}
                errors={setErrors}
                setErrors={setSetErrors}
                successMessage={setSuccessMessage}
                onSubmit={handleSetPassword}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Right Column: Authentication Info & Security Tips (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <LinkedAuthMethodsCard />
          <ActiveSessionCard onLogout={logout} />
          <SecurityTipsCard />
        </div>
      </div>
    </div>
  );
};
