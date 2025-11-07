import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateDoctorBody,
  FindDoctorParams,
  LoginDoctorBody,
  RegisterDoctorBody,
  UpdateDoctorBody
} from '~/models/requests/doctors.request'
import doctorsServices from '~/services/doctors.services'

const DOCTORS_MESSAGES = {
  CREATE_DOCTOR_SUCCESS: 'Create doctor successfully',
  GET_DOCTORS_SUCCESS: 'Get doctors successfully',
  GET_DOCTOR_SUCCESS: 'Get doctor successfully',
  UPDATE_DOCTOR_SUCCESS: 'Update doctor successfully',
  DELETE_DOCTOR_SUCCESS: 'Delete doctor successfully',
  DOCTOR_NOT_FOUND: 'Doctor not found',
  GET_AVAILABLE_DOCTORS_SUCCESS: 'Get available doctors successfully',
  LOGIN_SUCCESS: 'Login successfully',
  REGISTER_SUCCESS: 'Register successfully'
}

export const createDoctorController = async (
  req: Request<ParamsDictionary, any, CreateDoctorBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctor = await doctorsServices.createDoctor(req.body)
    return res.status(201).json({
      message: DOCTORS_MESSAGES.CREATE_DOCTOR_SUCCESS,
      doctor_id: doctor.insertedId
    })
  } catch (error) {
    next(error)
  }
}

export const getDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await doctorsServices.getDoctors()
    return res.json({ message: DOCTORS_MESSAGES.GET_DOCTORS_SUCCESS, doctors })
  } catch (error) {
    next(error)
  }
}

export const getDoctorController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const doctor = await doctorsServices.getDoctor(req.params.doctor_id)
    if (!doctor) {
      return res.status(404).json({ message: DOCTORS_MESSAGES.DOCTOR_NOT_FOUND })
    }
    return res.json({ message: DOCTORS_MESSAGES.GET_DOCTOR_SUCCESS, doctor })
  } catch (error) {
    next(error)
  }
}

export const getAvailableDoctorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { day } = req.query
    const dayNumber = parseInt(day as string, 10)

    if (isNaN(dayNumber) || dayNumber < 0 || dayNumber > 6) {
      return res.status(400).json({ message: 'Invalid day parameter. Must be 0-6 (0=Sunday)' })
    }

    const doctors = await doctorsServices.getAvailableDoctors(dayNumber)
    return res.json({ message: DOCTORS_MESSAGES.GET_AVAILABLE_DOCTORS_SUCCESS, doctors })
  } catch (error) {
    next(error)
  }
}

export const updateDoctorController = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  try {
    const existingDoctor = await doctorsServices.getDoctor(req.params.doctor_id)
    if (!existingDoctor) {
      return res.status(404).json({ message: DOCTORS_MESSAGES.DOCTOR_NOT_FOUND })
    }

    const doctor = await doctorsServices.updateDoctor(req.params.doctor_id, req.body)
    return res.json({ message: DOCTORS_MESSAGES.UPDATE_DOCTOR_SUCCESS, doctor })
  } catch (error) {
    next(error)
  }
}

export const deleteDoctorController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const doctor = await doctorsServices.deleteDoctor(req.params.doctor_id)
    if (doctor.deletedCount === 0) {
      return res.status(404).json({ message: DOCTORS_MESSAGES.DOCTOR_NOT_FOUND })
    }
    return res.json({ message: DOCTORS_MESSAGES.DELETE_DOCTOR_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const registerDoctorController = async (
  req: Request<ParamsDictionary, any, RegisterDoctorBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await doctorsServices.register(req.body)
    return res.status(201).json({
      message: DOCTORS_MESSAGES.REGISTER_SUCCESS,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const loginDoctorController = async (
  req: Request<ParamsDictionary, any, LoginDoctorBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await doctorsServices.login(req.body)
    return res.json({
      message: DOCTORS_MESSAGES.LOGIN_SUCCESS,
      data: result
    })
  } catch (error) {
    next(error)
  }
}
