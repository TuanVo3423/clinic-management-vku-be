import databaseServices from '~/services/database.services'
import MailService from '~/utils/mail'

const mailService = new MailService()

export async function watchAppointments() {
  try {
    await databaseServices.connect()
    const db = databaseServices.getDB()
    const collection = db.collection('appointments')

    console.log('👂 Đang lắng nghe thay đổi trên collection "appointments"...')

    const changeStream = collection.watch()

    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const newAppointment = change.fullDocument
        console.log('🆕 Lịch hẹn mới được thêm:', newAppointment)

        // ví dụ: gửi mail xác nhận cho bệnh nhân
        await mailService.sendMail(
          'tuanvv.21it@vku.udn.vn', // đảm bảo field này tồn tại
          'Xác nhận lịch hẹn',
          `Xin chào, bạn đã có một lịch hẹn mới vào ngày ${newAppointment.appointmentStartTime}, vui lòng kiểm tra chi tiết trong hệ thống.`
        )
      }
    })
  } catch (error) {
    console.error('❌ Lỗi trong watcher:', error)
  }
}
