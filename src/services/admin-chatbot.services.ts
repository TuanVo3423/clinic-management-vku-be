import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import databaseServices from './database.services'
import { ObjectId } from 'mongodb'
import { AdminChatbotQueryBody, ChatbotResponse } from '~/models/requests/admin-chatbot.request'

class AdminChatbotServices {
  private model: ChatGoogleGenerativeAI

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      modelName: 'gemini-2.5-flash',
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      temperature: 0.3
    })
  }

  /**
   * Xử lý câu hỏi từ admin và phân tích intent
   */
  async processQuery(payload: AdminChatbotQueryBody): Promise<ChatbotResponse> {
    const { message } = payload

    try {
      // Tạo prompt cho Gemini để phân tích intent
      const systemPrompt = `Bạn là trợ lý AI thông minh cho hệ thống quản lý phòng khám. 
Nhiệm vụ của bạn là phân tích câu hỏi của admin và xác định intent cũng như trích xuất thông tin cần thiết.

Có 4 loại intent chính:
1. **get_appointments**: Thống kê/lấy danh sách lịch hẹn
   - Trích xuất: startDate, endDate, status (pending/confirmed/completed/cancelled)
   - Ví dụ: "Cho tôi xem lịch hẹn tuần này", "Lịch hẹn đã hoàn thành tháng 12"

2. **get_appointment_revenue**: Thống kê doanh thu
   - Trích xuất: startDate, endDate
   - Ví dụ: "Doanh thu tháng này là bao nhiêu?", "Tính doanh thu tuần trước"

3. **export_appointments**: Xuất file lịch hẹn
   - Trích xuất: format (excel/pdf/csv), startDate, endDate, status
   - Ví dụ: "Xuất file Excel lịch hẹn tháng 12", "Export PDF lịch hẹn đã xác nhận"

4. **search_appointments**: Tìm kiếm lịch hẹn
   - Trích xuất: query (tên/SĐT), searchBy (patient_name/patient_phone/doctor_name)
   - Ví dụ: "Tìm lịch hẹn của bệnh nhân Nguyễn Văn A", "Tìm theo số điện thoại 0912345678"

QUAN TRỌNG về ngày tháng:
- Ngày hôm nay: ${new Date().toLocaleDateString('vi-VN')}
- "hôm nay" = ngày hiện tại
- "tuần này" = từ thứ 2 đến chủ nhật tuần hiện tại
- "tháng này" = từ ngày 1 đến ngày cuối tháng hiện tại
- "tuần trước" = tuần trước tuần hiện tại
- "tháng trước" = tháng trước tháng hiện tại
- Format ngày: YYYY-MM-DD (ISO 8601)

Phản hồi của bạn PHẢI là JSON hợp lệ theo format:
{
  "intent": "tên_intent",
  "parameters": {
    // các tham số cần thiết
  },
  "confidence": 0.0-1.0,
  "responseMessage": "Câu trả lời tự nhiên cho user"
}

Nếu không hiểu câu hỏi, trả về:
{
  "intent": "unknown",
  "parameters": {},
  "confidence": 0,
  "responseMessage": "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về thống kê lịch hẹn, doanh thu, tìm kiếm hoặc xuất file."
}

Chỉ trả về JSON, không thêm text nào khác.`

      const userMessage = `Câu hỏi: ${message}`

      // Gọi Gemini để phân tích
      const response = await this.model.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ])

      // Parse response từ Gemini
      const content = response.content as string
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim()
      const intentData = JSON.parse(cleanedContent)

      console.log('🤖 Gemini Intent Analysis:', intentData)

      // Xử lý theo intent
      return await this.handleIntent(intentData)
    } catch (error) {
      console.error('❌ Error processing query:', error)
      return {
        message: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.',
        data: null
      }
    }
  }

  /**
   * Xử lý intent và gọi các service tương ứng
   */
  private async handleIntent(intentData: any): Promise<ChatbotResponse> {
    const { intent, parameters, responseMessage } = intentData

    switch (intent) {
      case 'get_appointments':
        return await this.handleGetAppointments(parameters, responseMessage)

      case 'get_appointment_revenue':
        return await this.handleGetRevenue(parameters, responseMessage)

      case 'export_appointments':
        return await this.handleExportAppointments(parameters, responseMessage)

      case 'search_appointments':
        return await this.handleSearchAppointments(parameters, responseMessage)

      case 'unknown':
      default:
        return {
          message:
            responseMessage || 'Tôi chưa hiểu yêu cầu của bạn. Bạn có thể hỏi về lịch hẹn, doanh thu, hoặc xuất file.',
          data: null
        }
    }
  }

  /**
   * Intent 1: Lấy danh sách lịch hẹn và thống kê
   */
  private async handleGetAppointments(params: any, responseMsg: string): Promise<ChatbotResponse> {
    try {
      const { startDate, endDate, status } = params

      // Query appointments
      const query: any = {}

      // Filter theo thời gian
      if (startDate || endDate) {
        query.appointmentDate = {}
        if (startDate) query.appointmentDate.$gte = new Date(startDate)
        if (endDate) query.appointmentDate.$lte = new Date(endDate)
      }

      // Filter theo status
      if (status) {
        query.status = status
      }

      const appointments = await databaseServices.appointments.find(query).toArray()

      // Thống kê
      const stats = {
        total: appointments.length,
        byStatus: {
          pending: appointments.filter((a) => a.status === 'pending').length,
          confirmed: appointments.filter((a) => a.status === 'confirmed').length,
          completed: appointments.filter((a) => a.status === 'completed').length,
          cancelled: appointments.filter((a) => a.status === 'cancelled').length
        },
        totalRevenue: appointments.filter((a) => a.isCheckout).reduce((sum, a) => sum + (a.price || 0), 0)
      }

      // Populate thông tin bệnh nhân và bác sĩ
      const populatedAppointments = await Promise.all(
        appointments.map(async (apt) => {
          const patient = await databaseServices.patients.findOne({ _id: apt.patientId })
          const doctor = apt.doctorId ? await databaseServices.doctors.findOne({ _id: apt.doctorId }) : null
          const services = await databaseServices.services.find({ _id: { $in: apt.serviceIds } }).toArray()

          return {
            ...apt,
            patient: patient ? { name: patient.fullName, phone: patient.phone } : null,
            doctor: doctor ? { name: doctor.name, specialty: doctor.specialization } : null,
            services: services.map((s) => ({ name: s.name, price: s.price }))
          }
        })
      )

      return {
        message: responseMsg || `Đã tìm thấy ${stats.total} lịch hẹn phù hợp.`,
        data: {
          appointments: populatedAppointments,
          statistics: stats,
          filter: {
            startDate,
            endDate,
            status
          }
        },
        intent: 'get_appointments'
      }
    } catch (error) {
      console.error('❌ Error in handleGetAppointments:', error)
      return {
        message: 'Có lỗi xảy ra khi lấy danh sách lịch hẹn.',
        data: null
      }
    }
  }

  /**
   * Intent 2: Thống kê doanh thu
   */
  private async handleGetRevenue(params: any, responseMsg: string): Promise<ChatbotResponse> {
    try {
      const { startDate, endDate } = params

      // Query appointments đã thanh toán
      const query: any = {
        isCheckout: true,
        status: { $in: ['completed', 'confirmed'] }
      }

      if (startDate || endDate) {
        query.appointmentDate = {}
        if (startDate) query.appointmentDate.$gte = new Date(startDate)
        if (endDate) query.appointmentDate.$lte = new Date(endDate)
      }

      const appointments = await databaseServices.appointments.find(query).toArray()

      // Tính toán doanh thu
      const totalRevenue = appointments.reduce((sum, a) => sum + (a.price || 0), 0)
      const averageRevenue = appointments.length > 0 ? totalRevenue / appointments.length : 0

      // Doanh thu theo ngày
      const revenueByDate: { [key: string]: number } = {}
      appointments.forEach((apt) => {
        const dateKey = apt.appointmentDate.toISOString().split('T')[0]
        revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + (apt.price || 0)
      })

      return {
        message: responseMsg || `Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VNĐ`,
        data: {
          totalRevenue,
          averageRevenue,
          totalAppointments: appointments.length,
          revenueByDate: Object.entries(revenueByDate)
            .map(([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          filter: {
            startDate,
            endDate
          }
        },
        intent: 'get_appointment_revenue'
      }
    } catch (error) {
      console.error('❌ Error in handleGetRevenue:', error)
      return {
        message: 'Có lỗi xảy ra khi thống kê doanh thu.',
        data: null
      }
    }
  }

  /**
   * Intent 3: Xuất file (Frontend sẽ xử lý generate file)
   */
  private async handleExportAppointments(params: any, responseMsg: string): Promise<ChatbotResponse> {
    try {
      const { format, startDate, endDate, status } = params

      // Query appointments
      const query: any = {}

      if (startDate || endDate) {
        query.appointmentDate = {}
        if (startDate) query.appointmentDate.$gte = new Date(startDate)
        if (endDate) query.appointmentDate.$lte = new Date(endDate)
      }

      if (status) {
        query.status = status
      }

      const appointments = await databaseServices.appointments.find(query).toArray()

      // Populate thông tin chi tiết
      const exportData = await Promise.all(
        appointments.map(async (apt) => {
          const patient = await databaseServices.patients.findOne({ _id: apt.patientId })
          const doctor = apt.doctorId ? await databaseServices.doctors.findOne({ _id: apt.doctorId }) : null
          const services = await databaseServices.services.find({ _id: { $in: apt.serviceIds } }).toArray()

          return {
            id: apt._id.toString(),
            patientName: patient?.fullName || 'N/A',
            patientPhone: patient?.phone || 'N/A',
            doctorName: doctor?.name || 'N/A',
            services: services.map((s) => s.name).join(', '),
            appointmentDate: apt.appointmentDate.toISOString().split('T')[0],
            startTime: apt.appointmentStartTime,
            endTime: apt.appointmentEndTime,
            status: apt.status,
            price: apt.price,
            isCheckout: apt.isCheckout ? 'Đã thanh toán' : 'Chưa thanh toán',
            note: apt.note || ''
          }
        })
      )

      return {
        message: responseMsg || `Dữ liệu xuất file ${format.toUpperCase()} đã sẵn sàng (${exportData.length} bản ghi)`,
        data: exportData,
        intent: 'export_appointments',
        requiresAction: true,
        actionType: 'export_file',
        actionData: {
          format,
          totalRecords: exportData.length,
          filter: { startDate, endDate, status }
        }
      }
    } catch (error) {
      console.error('❌ Error in handleExportAppointments:', error)
      return {
        message: 'Có lỗi xảy ra khi chuẩn bị dữ liệu xuất file.',
        data: null
      }
    }
  }

  /**
   * Intent 4: Tìm kiếm lịch hẹn
   */
  private async handleSearchAppointments(params: any, responseMsg: string): Promise<ChatbotResponse> {
    try {
      const { query, searchBy } = params

      let results: any[] = []

      switch (searchBy) {
        case 'patient_name': {
          // Tìm bệnh nhân theo tên
          const patients = await databaseServices.patients
            .find({
              name: { $regex: query, $options: 'i' }
            })
            .toArray()

          const patientIds = patients.map((p) => p._id)

          if (patientIds.length > 0) {
            results = await databaseServices.appointments
              .find({
                patientId: { $in: patientIds }
              })
              .toArray()
          }
          break
        }

        case 'patient_phone': {
          // Tìm bệnh nhân theo SĐT
          const patient = await databaseServices.patients.findOne({
            phone: query
          })

          if (patient) {
            results = await databaseServices.appointments
              .find({
                patientId: patient._id
              })
              .toArray()
          }
          break
        }

        case 'doctor_name': {
          // Tìm bác sĩ theo tên
          const doctors = await databaseServices.doctors
            .find({
              name: { $regex: query, $options: 'i' }
            })
            .toArray()

          const doctorIds = doctors.map((d) => d._id)

          if (doctorIds.length > 0) {
            results = await databaseServices.appointments
              .find({
                doctorId: { $in: doctorIds }
              })
              .toArray()
          }
          break
        }
      }

      // Populate thông tin chi tiết
      const populatedResults = await Promise.all(
        results.map(async (apt) => {
          const patient = await databaseServices.patients.findOne({ _id: apt.patientId })
          const doctor = apt.doctorId ? await databaseServices.doctors.findOne({ _id: apt.doctorId }) : null
          const services = await databaseServices.services.find({ _id: { $in: apt.serviceIds } }).toArray()

          return {
            ...apt,
            patient: patient ? { name: patient.fullName, phone: patient.phone } : null,
            doctor: doctor ? { name: doctor.name, specialty: doctor.specialization } : null,
            services: services.map((s) => ({ name: s.name, price: s.price }))
          }
        })
      )

      return {
        message: responseMsg || `Tìm thấy ${populatedResults.length} kết quả`,
        data: {
          results: populatedResults,
          searchCriteria: {
            query,
            searchBy
          }
        },
        intent: 'search_appointments'
      }
    } catch (error) {
      console.error('❌ Error in handleSearchAppointments:', error)
      return {
        message: 'Có lỗi xảy ra khi tìm kiếm.',
        data: null
      }
    }
  }
}

const adminChatbotServices = new AdminChatbotServices()
export default adminChatbotServices
