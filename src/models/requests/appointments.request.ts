import core from 'express-serve-static-core'

export interface CreateAppointmentBody {
  patientId: string
  doctorId?: string
  serviceId: string
  appointmentDate: string
  isEmergency?: boolean
  note?: string
}

export interface UpdateAppointmentBody {
  doctorId?: string
  serviceId?: string
  appointmentDate?: string
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  isEmergency?: boolean
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