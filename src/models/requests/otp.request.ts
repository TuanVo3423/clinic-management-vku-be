export interface RequestOtpBody {
  email: string
  phone: string
  purpose: 'create_patient' | 'get_patient_by_phone'
}

export interface VerifyOtpBody {
  email: string
  phone: string
  code: string
  purpose: 'create_patient' | 'get_patient_by_phone'
}

export interface OtpSessionData {
  otpVerified: boolean
  email: string
  phone: string
  purpose: 'create_patient' | 'get_patient_by_phone'
  verifiedAt: Date
}
