import { Router } from 'express'
import {
  createDoctorController,
  deleteDoctorController,
  getDoctorController,
  getDoctorsController,
  getAvailableDoctorsController,
  updateDoctorController
} from '~/controllers/doctors.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const doctorsRouter = Router()

// Tạo bác sĩ mới
doctorsRouter.post('/', wrapRequestHandler(createDoctorController))

// Lấy danh sách tất cả bác sĩ
doctorsRouter.get('/', wrapRequestHandler(getDoctorsController))

// Lấy bác sĩ có thể làm việc trong ngày cụ thể
doctorsRouter.get('/available', wrapRequestHandler(getAvailableDoctorsController))

// Lấy bác sĩ theo ID
doctorsRouter.get('/:doctor_id', wrapRequestHandler(getDoctorController))

// Cập nhật thông tin bác sĩ
doctorsRouter.patch('/:doctor_id', wrapRequestHandler(updateDoctorController))

// Xóa bác sĩ
doctorsRouter.delete('/:doctor_id', wrapRequestHandler(deleteDoctorController))

export default doctorsRouter