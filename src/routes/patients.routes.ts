import { Router } from 'express'
import {
  createPatientController,
  deletePatientController,
  getPatientController,
  getPatientsController,
  getPatientByPhoneController,
  updatePatientController,
  registerPatientController,
  completeRegisterController,
  loginPatientController,
  completeLoginController
} from '~/controllers/patients.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const patientsRouter = Router()

// ===== REGISTER FLOW =====
// Bước 1: Đăng ký - gửi OTP về email
patientsRouter.post('/register', wrapRequestHandler(registerPatientController))

// Bước 2: Xác thực OTP và hoàn tất đăng ký
patientsRouter.post('/complete-register', wrapRequestHandler(completeRegisterController))

// ===== LOGIN FLOW =====
// Bước 1: Đăng nhập - kiểm tra phone và gửi OTP
patientsRouter.post('/login', wrapRequestHandler(loginPatientController))

// Bước 2: Xác thực OTP và hoàn tất đăng nhập
patientsRouter.post('/complete-login', wrapRequestHandler(completeLoginController))

// ===== CRUD OPERATIONS =====
// Tạo bệnh nhân mới (direct - không qua OTP, dùng cho admin)
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
