import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreatePatientBody,
  FindPatientParams,
  UpdatePatientBody,
  FindPatientByPhoneParams
} from '~/models/requests/patients.request'
import patientsServices from '~/services/patients.services'
import otpService from '~/services/otp.services'

const PATIENTS_MESSAGES = {
  CREATE_PATIENT_SUCCESS: 'Create patient successfully',
  REGISTER_OTP_SENT: 'OTP has been sent to your email. Please verify to complete registration',
  REGISTER_SUCCESS: 'Registration completed successfully',
  LOGIN_OTP_SENT: 'OTP has been sent to your email. Please verify to login',
  LOGIN_SUCCESS: 'Login successfully',
  GET_PATIENTS_SUCCESS: 'Get patients successfully',
  GET_PATIENT_SUCCESS: 'Get patient successfully',
  UPDATE_PATIENT_SUCCESS: 'Update patient successfully',
  DELETE_PATIENT_SUCCESS: 'Delete patient successfully',
  PATIENT_NOT_FOUND: 'Patient not found',
  PHONE_ALREADY_EXISTS: 'Phone number already exists',
  EMAIL_REQUIRED: 'Email is required for registration',
  PHONE_REQUIRED: 'Phone number is required',
  INVALID_OTP: 'Invalid or expired OTP',
  PATIENT_EMAIL_REQUIRED: 'Patient must have email to login'
}

export const createPatientController = async (
  req: Request<ParamsDictionary, any, CreatePatientBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const existingPatient = await patientsServices.getPatientByPhone(req.body.phone)
    if (existingPatient) {
      return res.status(400).json({ message: PATIENTS_MESSAGES.PHONE_ALREADY_EXISTS })
    }

    const patient = await patientsServices.createPatient(req.body)
    return res.status(201).json({
      message: PATIENTS_MESSAGES.CREATE_PATIENT_SUCCESS,
      patient_id: patient.insertedId
    })
  } catch (error) {
    next(error)
  }
}

export const getPatientsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await patientsServices.getPatients()
    return res.json({ message: PATIENTS_MESSAGES.GET_PATIENTS_SUCCESS, patients })
  } catch (error) {
    next(error)
  }
}

export const getPatientController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const patient = await patientsServices.getPatient(req.params.patient_id)
    if (!patient) {
      return res.status(404).json({ message: PATIENTS_MESSAGES.PATIENT_NOT_FOUND })
    }
    return res.json({ message: PATIENTS_MESSAGES.GET_PATIENT_SUCCESS, patient })
  } catch (error) {
    next(error)
  }
}

export const getPatientByPhoneController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const patient = await patientsServices.getPatientByPhone(req.params.phone)
    if (!patient) {
      return res.status(404).json({ message: PATIENTS_MESSAGES.PATIENT_NOT_FOUND })
    }
    return res.json({ message: PATIENTS_MESSAGES.GET_PATIENT_SUCCESS, patient })
  } catch (error) {
    next(error)
  }
}

export const updatePatientController = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  try {
    // Kiểm tra xem bệnh nhân có tồn tại không
    const existingPatient = await patientsServices.getPatient(req.params.patient_id)
    if (!existingPatient) {
      return res.status(404).json({ message: PATIENTS_MESSAGES.PATIENT_NOT_FOUND })
    }

    // Nếu cập nhật số điện thoại, kiểm tra trùng lặp
    if (req.body.phone && req.body.phone !== existingPatient.phone) {
      const phoneExists = await patientsServices.getPatientByPhone(req.body.phone)
      if (phoneExists) {
        return res.status(400).json({ message: PATIENTS_MESSAGES.PHONE_ALREADY_EXISTS })
      }
    }

    const patient = await patientsServices.updatePatient(req.params.patient_id, req.body)
    return res.json({ message: PATIENTS_MESSAGES.UPDATE_PATIENT_SUCCESS, patient })
  } catch (error) {
    next(error)
  }
}

export const deletePatientController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const patient = await patientsServices.deletePatient(req.params.patient_id)
    if (patient.deletedCount === 0) {
      return res.status(404).json({ message: PATIENTS_MESSAGES.PATIENT_NOT_FOUND })
    }
    return res.json({ message: PATIENTS_MESSAGES.DELETE_PATIENT_SUCCESS })
  } catch (error) {
    next(error)
  }
}

// REGISTER FLOW
// Bước 1: Đăng ký - gửi OTP về email
export const registerPatientController = async (
  req: Request<ParamsDictionary, any, CreatePatientBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone, fullName, dateOfBirth, gender } = req.body

    // Validate
    if (!email) {
      return res.status(400).json({ message: PATIENTS_MESSAGES.EMAIL_REQUIRED })
    }
    if (!phone) {
      return res.status(400).json({ message: PATIENTS_MESSAGES.PHONE_REQUIRED })
    }

    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const existingPatient = await patientsServices.getPatientByPhone(phone)
    if (existingPatient) {
      return res.status(400).json({ message: PATIENTS_MESSAGES.PHONE_ALREADY_EXISTS })
    }

    // Gửi OTP về email
    const result = await otpService.requestOtp({
      email,
      phone,
      purpose: 'create_patient'
    })

    return res.status(200).json({
      message: PATIENTS_MESSAGES.REGISTER_OTP_SENT,
      data: {
        email,
        phone,
        expiresAt: result.expiresAt
      }
    })
  } catch (error) {
    next(error)
  }
}

// Bước 2: Xác thực OTP và hoàn tất đăng ký
export const completeRegisterController = async (
  req: Request<ParamsDictionary, any, CreatePatientBody & { code: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone, code, fullName, dateOfBirth, gender } = req.body

    // Validate
    if (!email || !phone || !code) {
      return res.status(400).json({ message: 'Email, phone and OTP code are required' })
    }

    // Verify OTP
    try {
      await otpService.verifyOtp({ email, phone, code, purpose: 'create_patient' })
    } catch (error: any) {
      return res.status(400).json({ message: error.message || PATIENTS_MESSAGES.INVALID_OTP })
    }

    // Tạo patient
    const patient = await patientsServices.createPatient({
      email,
      phone,
      fullName,
      dateOfBirth,
      gender
    })

    // Xóa OTP đã sử dụng
    await otpService.deleteVerifiedOtp(email, phone, 'create_patient')

    return res.status(201).json({
      message: PATIENTS_MESSAGES.REGISTER_SUCCESS,
      data: {
        patient_id: patient.insertedId
      }
    })
  } catch (error) {
    next(error)
  }
}

// LOGIN FLOW
// Bước 1: Đăng nhập - kiểm tra phone và gửi OTP
export const loginPatientController = async (
  req: Request<ParamsDictionary, any, { phone: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({ message: PATIENTS_MESSAGES.PHONE_REQUIRED })
    }

    // Kiểm tra patient có tồn tại không
    const patient = await patientsServices.getPatientByPhone(phone)
    if (!patient) {
      return res.status(404).json({ message: PATIENTS_MESSAGES.PATIENT_NOT_FOUND })
    }

    // Kiểm tra patient có email không
    if (!patient.email) {
      return res.status(400).json({ message: PATIENTS_MESSAGES.PATIENT_EMAIL_REQUIRED })
    }

    // Gửi OTP về email
    const result = await otpService.requestOtp({
      email: patient.email,
      phone,
      purpose: 'get_patient_by_phone'
    })

    return res.status(200).json({
      message: PATIENTS_MESSAGES.LOGIN_OTP_SENT,
      data: {
        email: patient.email, // Trả về email để client biết
        expiresAt: result.expiresAt
      }
    })
  } catch (error) {
    next(error)
  }
}

// Bước 2: Xác thực OTP và hoàn tất đăng nhập
export const completeLoginController = async (
  req: Request<ParamsDictionary, any, { phone: string; code: string; email: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone, code, email } = req.body

    if (!phone || !code || !email) {
      return res.status(400).json({ message: 'Phone, email and OTP code are required' })
    }

    // Verify OTP
    try {
      await otpService.verifyOtp({ email, phone, code, purpose: 'get_patient_by_phone' })
    } catch (error: any) {
      return res.status(400).json({ message: error.message || PATIENTS_MESSAGES.INVALID_OTP })
    }

    // Lấy thông tin patient
    const patient = await patientsServices.getPatientByPhone(phone)
    if (!patient) {
      return res.status(404).json({ message: PATIENTS_MESSAGES.PATIENT_NOT_FOUND })
    }

    // Xóa OTP đã sử dụng
    await otpService.deleteVerifiedOtp(email, phone, 'get_patient_by_phone')

    return res.status(200).json({
      message: PATIENTS_MESSAGES.LOGIN_SUCCESS,
      data: {
        patient
      }
    })
  } catch (error) {
    next(error)
  }
}
