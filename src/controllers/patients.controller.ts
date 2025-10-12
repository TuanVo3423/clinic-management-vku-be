import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreatePatientBody, FindPatientParams, UpdatePatientBody, FindPatientByPhoneParams } from '~/models/requests/patients.request'
import patientsServices from '~/services/patients.services'

const PATIENTS_MESSAGES = {
  CREATE_PATIENT_SUCCESS: 'Create patient successfully',
  GET_PATIENTS_SUCCESS: 'Get patients successfully',
  GET_PATIENT_SUCCESS: 'Get patient successfully',
  UPDATE_PATIENT_SUCCESS: 'Update patient successfully',
  DELETE_PATIENT_SUCCESS: 'Delete patient successfully',
  PATIENT_NOT_FOUND: 'Patient not found',
  PHONE_ALREADY_EXISTS: 'Phone number already exists'
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