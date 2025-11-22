export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  Completed = 'completed'
}


export function parseStatus(input: string): AppointmentStatus | null {
  // normalize
  const normalized = input.trim().toLowerCase();

  if (normalized in AppointmentStatus) {
    return AppointmentStatus[normalized as keyof typeof AppointmentStatus];
  }

  return null;
}