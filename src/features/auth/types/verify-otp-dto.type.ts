// OTP Purpose type
export type OtpPurpose = 'REGISTER' | 'FORGOT_PASSWORD';

// Verify OTP request DTO
export interface VerifyOtpDto {
  email: string;
  code: string;
  purpose: OtpPurpose;
}
