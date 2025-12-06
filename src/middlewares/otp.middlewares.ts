import { NextFunction, Request, Response } from 'express'
import otpService from '~/services/otp.services'

// Middleware xác thực OTP cho việc tạo bệnh nhân mới
export const verifyOtpForCreatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone } = req.body

    if (!email || !phone) {
      return res.status(400).json({
        message: 'Email và số điện thoại là bắt buộc'
      })
    }

    // Kiểm tra xem OTP đã được verify chưa
    const isVerified = await otpService.isOtpVerified(email, phone, 'create_patient')

    if (!isVerified) {
      return res.status(403).json({
        message: 'Vui lòng xác thực OTP trước khi tạo bệnh nhân mới'
      })
    }

    // Xóa OTP đã verify sau khi sử dụng
    await otpService.deleteVerifiedOtp(email, phone, 'create_patient')

    next()
  } catch (error) {
    next(error)
  }
}

// Middleware xác thực OTP cho việc lấy thông tin bệnh nhân theo số điện thoại
export const verifyOtpForGetPatientByPhone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.params

    if (!phone) {
      return res.status(400).json({
        message: 'Số điện thoại là bắt buộc'
      })
    }

    // Kiểm tra xem OTP đã được verify chưa cho phone này
    const isVerified = await otpService.isOtpVerifiedByPhone(phone, 'get_patient_by_phone')

    if (!isVerified) {
      return res.status(403).json({
        message: 'Vui lòng xác thực OTP trước khi truy cập thông tin bệnh nhân'
      })
    }

    // Xóa OTP đã verify sau khi sử dụng
    await otpService.deleteVerifiedOtpByPhone(phone, 'get_patient_by_phone')

    next()
  } catch (error) {
    next(error)
  }
}
