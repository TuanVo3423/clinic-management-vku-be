import core from 'express-serve-static-core'
import { AppointmentStatus } from '~/constants/enums'

export interface CreateAppointmentBody {
  patientId: string
  doctorId?: string
  serviceIds: string[]
  bedId?: string
  appointmentDate: string
  isEmergency?: boolean
  note?: string
  appointmentStartTime: string
  appointmentEndTime: string
  status?: string
}

export interface UpdateAppointmentBody {
  doctorId?: string
  serviceIds?: string[]
  patientId?: string
  bedId?: string
  appointmentDate?: string
  appointmentStartTime?: string
  appointmentEndTime?: string
  status?: AppointmentStatus
  isEmergency?: boolean
  isCheckout?: boolean
  note?: string
}

export interface FindAppointmentParams extends core.ParamsDictionary {
  appointment_id: string
}

export interface FindAppointmentsByPatientParams extends core.ParamsDictionary {
  patient_id: string
}

export interface FindAppointmentsByDoctorParams extends core.ParamsDictionary {
  doctor_id: string
}
