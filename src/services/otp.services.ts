import databaseServices from './database.services'
import Otp from '~/models/schemas/Otp.schema'
import { RequestOtpBody, VerifyOtpBody } from '~/models/requests/otp.request'
import MailService from '~/utils/mail'

class OtpService {
  private mailService: MailService

  constructor() {
    this.mailService = new MailService()
  }

  // Tạo mã OTP gồm 6 số
  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Tạo và gửi OTP
  async requestOtp(payload: RequestOtpBody) {
    const { email, phone, purpose } = payload

    // Xóa các OTP cũ chưa verify của cùng email, phone và purpose
    await databaseServices.otps.deleteMany({
      email,
      phone,
      purpose,
      verified: false
    })

    // Tạo mã OTP mới
    const code = this.generateOtpCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // Hết hạn sau 5 phút

    // Lưu OTP vào database
    const otpData = new Otp({
      email,
      phone,
      code,
      purpose,
      expiresAt,
      verified: false
    })

    await databaseServices.otps.insertOne(otpData)

    // Gửi email
    const purposeText = purpose === 'create_patient' ? 'đăng ký tài khoản bệnh nhân' : 'truy cập thông tin bệnh nhân'

    const subject = 'Mã xác thực OTP - VKU Clinic'
    const text = `
Xin chào,

Mã OTP của bạn để ${purposeText} là: ${code}

Mã này sẽ hết hạn sau 5 phút.

Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.

Trân trọng,
VKU Clinic
    `

    await this.mailService.sendMail(email, subject, text)

    return {
      message: 'OTP đã được gửi đến email của bạn',
      expiresAt
    }
  }

  // Xác thực OTP
  async verifyOtp(payload: VerifyOtpBody) {
    const { email, phone, code, purpose } = payload

    // Tìm OTP
    const otp = await databaseServices.otps.findOne({
      email,
      phone,
      code,
      purpose,
      verified: false
    })

    if (!otp) {
      throw new Error('Mã OTP không hợp lệ hoặc đã được sử dụng')
    }

    // Kiểm tra thời gian hết hạn
    if (new Date() > otp.expiresAt) {
      throw new Error('Mã OTP đã hết hạn')
    }

    // Đánh dấu OTP đã được verify
    await databaseServices.otps.updateOne({ _id: otp._id }, { $set: { verified: true } })

    return {
      message: 'Xác thực OTP thành công',
      otpId: otp._id?.toString()
    }
  }

  // Kiểm tra xem OTP đã được verify chưa
  async isOtpVerified(
    email: string,
    phone: string,
    purpose: 'create_patient' | 'get_patient_by_phone'
  ): Promise<boolean> {
    const otp = await databaseServices.otps.findOne({
      email,
      phone,
      purpose,
      verified: true
    })

    // Kiểm tra OTP còn hạn trong 10 phút sau khi verify (để sử dụng)
    if (otp && otp.createdAt) {
      const tenMinutesAfterCreation = new Date(otp.createdAt.getTime() + 10 * 60 * 1000)
      if (new Date() <= tenMinutesAfterCreation) {
        return true
      }
    }

    return false
  }

  // Xóa OTP sau khi đã sử dụng
  async deleteVerifiedOtp(email: string, phone: string, purpose: 'create_patient' | 'get_patient_by_phone') {
    await databaseServices.otps.deleteMany({
      email,
      phone,
      purpose,
      verified: true
    })
  }

  // Kiểm tra xem OTP đã được verify chưa (chỉ cần phone)
  async isOtpVerifiedByPhone(phone: string, purpose: 'create_patient' | 'get_patient_by_phone'): Promise<boolean> {
    const otp = await databaseServices.otps.findOne({
      phone,
      purpose,
      verified: true
    })

    // Kiểm tra OTP còn hạn trong 10 phút sau khi verify (để sử dụng)
    if (otp && otp.createdAt) {
      const tenMinutesAfterCreation = new Date(otp.createdAt.getTime() + 10 * 60 * 1000)
      if (new Date() <= tenMinutesAfterCreation) {
        return true
      }
    }

    return false
  }

  // Xóa OTP sau khi đã sử dụng (chỉ cần phone)
  async deleteVerifiedOtpByPhone(phone: string, purpose: 'create_patient' | 'get_patient_by_phone') {
    await databaseServices.otps.deleteMany({
      phone,
      purpose,
      verified: true
    })
  }
}

const otpService = new OtpService()
export default otpService
