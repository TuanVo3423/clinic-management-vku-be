import nodemailer, { Transporter } from 'nodemailer'

class MailService {
  private transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    })
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"VKU Clinic" <tuanvanvo2003@gmail.com>',
        to,
        subject,
        text
      })

      console.log('✅ Mail sent:', info.messageId)
      return info
    } catch (error) {
      console.error('❌ Lỗi khi gửi mail:', error)
      throw error
    }
  }
}

export default MailService
