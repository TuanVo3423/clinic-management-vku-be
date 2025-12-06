import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RequestOtpBody, VerifyOtpBody } from '~/models/requests/otp.request'
import otpService from '~/services/otp.services'
import patientsServices from '~/services/patients.services'

const OTP_MESSAGES = {
  REQUEST_OTP_SUCCESS: 'OTP sent successfully',
  VERIFY_OTP_SUCCESS: 'OTP verified successfully',
  INVALID_OTP: 'Invalid or expired OTP',
  OTP_EXPIRED: 'OTP has expired',
  EMAIL_REQUIRED: 'Email is required',
  PHONE_REQUIRED: 'Phone number is required',
  PURPOSE_REQUIRED: 'Purpose is required',
  CODE_REQUIRED: 'OTP code is required',
  PATIENT_NOT_FOUND: 'Patient not found',
  PATIENT_EMAIL_REQUIRED: 'Patient must have email to receive OTP'
}

// Yêu cầu gửi OTP
export const requestOtpController = async (
  req: Request<ParamsDictionary, any, RequestOtpBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone, purpose } = req.body

    // Validate input
    if (!email) {
      return res.status(400).json({ message: OTP_MESSAGES.EMAIL_REQUIRED })
    }
    if (!phone) {
      return res.status(400).json({ message: OTP_MESSAGES.PHONE_REQUIRED })
    }
    if (!purpose) {
      return res.status(400).json({ message: OTP_MESSAGES.PURPOSE_REQUIRED })
    }

    const result = await otpService.requestOtp({ email, phone, purpose })

    return res.status(200).json({
      message: OTP_MESSAGES.REQUEST_OTP_SUCCESS,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Xác thực OTP
export const verifyOtpController = async (
  req: Request<ParamsDictionary, any, VerifyOtpBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone, code, purpose } = req.body

    // Validate input
    if (!email) {
      return res.status(400).json({ message: OTP_MESSAGES.EMAIL_REQUIRED })
    }
    if (!phone) {
      return res.status(400).json({ message: OTP_MESSAGES.PHONE_REQUIRED })
    }
    if (!code) {
      return res.status(400).json({ message: OTP_MESSAGES.CODE_REQUIRED })
    }
    if (!purpose) {
      return res.status(400).json({ message: OTP_MESSAGES.PURPOSE_REQUIRED })
    }

    const result = await otpService.verifyOtp({ email, phone, code, purpose })

    return res.status(200).json({
      message: OTP_MESSAGES.VERIFY_OTP_SUCCESS,
      data: result
    })
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || OTP_MESSAGES.INVALID_OTP
    })
  }
}

// Yêu cầu gửi OTP cho việc lấy thông tin patient by phone
export const requestOtpForGetPatientController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.params

    if (!phone) {
      return res.status(400).json({ message: OTP_MESSAGES.PHONE_REQUIRED })
    }

    // Kiểm tra patient có tồn tại không
    const patient = await patientsServices.getPatientByPhone(phone)
    if (!patient) {
      return res.status(404).json({ message: OTP_MESSAGES.PATIENT_NOT_FOUND })
    }

    // Kiểm tra patient có email không
    if (!patient.email) {
      return res.status(400).json({ message: OTP_MESSAGES.PATIENT_EMAIL_REQUIRED })
    }

    // Gửi OTP về email của patient
    const result = await otpService.requestOtp({
      email: patient.email,
      phone,
      purpose: 'get_patient_by_phone'
    })

    return res.status(200).json({
      message: OTP_MESSAGES.REQUEST_OTP_SUCCESS,
      data: {
        ...result,
        email: patient.email // Trả về email để client biết OTP đã gửi về đâu (có thể mask)
      }
    })
  } catch (error) {
    next(error)
  }
}
