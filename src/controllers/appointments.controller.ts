import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { 
  CreateAppointmentBody, 
  FindAppointmentParams, 
  UpdateAppointmentBody,
  FindAppointmentsByPatientParams,
  FindAppointmentsByDoctorParams
} from '~/models/requests/appointments.request'
import appointmentsServices from '~/services/appointments.services'
import patientsServices from '~/services/patients.services'

const APPOINTMENTS_MESSAGES = {
  CREATE_APPOINTMENT_SUCCESS: 'Create appointment successfully',
  GET_APPOINTMENTS_SUCCESS: 'Get appointments successfully',
  GET_APPOINTMENT_SUCCESS: 'Get appointment successfully',
  UPDATE_APPOINTMENT_SUCCESS: 'Update appointment successfully',
  DELETE_APPOINTMENT_SUCCESS: 'Delete appointment successfully',
  CANCEL_APPOINTMENT_SUCCESS: 'Cancel appointment successfully',
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  PATIENT_NOT_FOUND: 'Patient not found',
  GET_APPOINTMENTS_BY_DATE_SUCCESS: 'Get appointments by date successfully',
  GET_EMERGENCY_APPOINTMENTS_SUCCESS: 'Get emergency appointments successfully'
}

export const createAppointmentController = async (
  req: Request<ParamsDictionary, any, CreateAppointmentBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Kiểm tra bệnh nhân có tồn tại không
    const patient = await patientsServices.getPatient(req.body.patientId)
    if (!patient) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.PATIENT_NOT_FOUND })
    }

    const appointment = await appointmentsServices.createAppointment(req.body)
    return res.status(201).json({ 
      message: APPOINTMENTS_MESSAGES.CREATE_APPOINTMENT_SUCCESS, 
      appointment_id: appointment.insertedId 
    })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getAppointments()
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentsServices.getAppointment(req.params.appointment_id)
    if (!appointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENT_SUCCESS, appointment })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByPatientController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getAppointmentsByPatient(req.params.patient_id)
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByDoctorController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getAppointmentsByDoctor(req.params.doctor_id)
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByDateController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' })
    }

    const appointmentDate = new Date(date as string)
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    const appointments = await appointmentsServices.getAppointmentsByDate(appointmentDate)
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_BY_DATE_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getEmergencyAppointmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getEmergencyAppointments()
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_EMERGENCY_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const updateAppointmentController = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  try {
    const existingAppointment = await appointmentsServices.getAppointment(req.params.appointment_id)
    if (!existingAppointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }

    const appointment = await appointmentsServices.updateAppointment(req.params.appointment_id, req.body, 'system')
    return res.json({ message: APPOINTMENTS_MESSAGES.UPDATE_APPOINTMENT_SUCCESS, appointment })
  } catch (error) {
    next(error)
  }
}

export const cancelAppointmentController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const existingAppointment = await appointmentsServices.getAppointment(req.params.appointment_id)
    if (!existingAppointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }

    const appointment = await appointmentsServices.cancelAppointment(req.params.appointment_id, 'system')
    return res.json({ message: APPOINTMENTS_MESSAGES.CANCEL_APPOINTMENT_SUCCESS, appointment })
  } catch (error) {
    next(error)
  }
}

export const deleteAppointmentController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentsServices.deleteAppointment(req.params.appointment_id)
    if (appointment.deletedCount === 0) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }
    return res.json({ message: APPOINTMENTS_MESSAGES.DELETE_APPOINTMENT_SUCCESS })
  } catch (error) {
    next(error)
  }
}