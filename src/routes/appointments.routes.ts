import { Router } from 'express'
import {
  createAppointmentController,
  deleteAppointmentController,
  getAppointmentController,
  getAppointmentsController,
  getAppointmentsByPatientController,
  getAppointmentsByDoctorController,
  getAppointmentsByDateController,
  getAppointmentsByTimeRangeController,
  getEmergencyAppointmentsController,
  updateAppointmentController,
  cancelAppointmentController
} from '~/controllers/appointments.controller'
import { createAppointmentValidator, updateAppointmentValidator } from '~/middlewares/appointments.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const appointmentsRouter = Router()

// Tạo lịch hẹn mới
appointmentsRouter.post('/', wrapRequestHandler(createAppointmentController))

// Lấy danh sách tất cả lịch hẹn
appointmentsRouter.get('/', wrapRequestHandler(getAppointmentsController))

// Lấy lịch hẹn khẩn cấp
appointmentsRouter.get('/emergency', wrapRequestHandler(getEmergencyAppointmentsController))

// Lấy lịch hẹn theo ngày
appointmentsRouter.get('/by-date', wrapRequestHandler(getAppointmentsByDateController))

// Lấy lịch hẹn theo khoảng thời gian (range)
// Query params: startDate, endDate (required), doctorId, patientId (optional)
// Example: /by-time-range?startDate=2023-10-14T09:00:00Z&endDate=2023-10-20T17:00:00Z&doctorId=123
appointmentsRouter.get('/by-time-range', wrapRequestHandler(getAppointmentsByTimeRangeController))

// Lấy lịch hẹn theo bệnh nhân
appointmentsRouter.get('/patient/:patient_id', wrapRequestHandler(getAppointmentsByPatientController))

// Lấy lịch hẹn theo bác sĩ
appointmentsRouter.get('/doctor/:doctor_id', wrapRequestHandler(getAppointmentsByDoctorController))

// Lấy lịch hẹn theo ID
appointmentsRouter.get('/:appointment_id', wrapRequestHandler(getAppointmentController))

// Cập nhật lịch hẹn
appointmentsRouter.patch(
  '/:appointment_id',
  updateAppointmentValidator,
  wrapRequestHandler(updateAppointmentController)
)

// Hủy lịch hẹn
appointmentsRouter.patch('/:appointment_id/cancel', wrapRequestHandler(cancelAppointmentController))

// Xóa lịch hẹn
appointmentsRouter.delete('/:appointment_id', wrapRequestHandler(deleteAppointmentController))

export default appointmentsRouter
