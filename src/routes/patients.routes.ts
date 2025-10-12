import { Router } from 'express'
import {
  createPatientController,
  deletePatientController,
  getPatientController,
  getPatientsController,
  getPatientByPhoneController,
  updatePatientController
} from '~/controllers/patients.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const patientsRouter = Router()

// Tạo bệnh nhân mới
patientsRouter.post('/', wrapRequestHandler(createPatientController))

// Lấy danh sách tất cả bệnh nhân
patientsRouter.get('/', wrapRequestHandler(getPatientsController))

// Lấy bệnh nhân theo ID
patientsRouter.get('/:patient_id', wrapRequestHandler(getPatientController))

// Lấy bệnh nhân theo số điện thoại
patientsRouter.get('/phone/:phone', wrapRequestHandler(getPatientByPhoneController))

// Cập nhật thông tin bệnh nhân
patientsRouter.patch('/:patient_id', wrapRequestHandler(updatePatientController))

// Xóa bệnh nhân
patientsRouter.delete('/:patient_id', wrapRequestHandler(deletePatientController))

export default patientsRouter