import { Router } from 'express'
import {
  requestOtpController,
  verifyOtpController,
  requestOtpForGetPatientController
} from '~/controllers/otp.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const otpRouter = Router()

// Yêu cầu gửi OTP (dùng cho create patient)
otpRouter.post('/request', wrapRequestHandler(requestOtpController))

// Yêu cầu gửi OTP cho việc lấy thông tin patient by phone
otpRouter.post('/request-get-patient/:phone', wrapRequestHandler(requestOtpForGetPatientController))

// Xác thực OTP
otpRouter.post('/verify', wrapRequestHandler(verifyOtpController))

export default otpRouter
