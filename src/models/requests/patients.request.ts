import core from 'express-serve-static-core'

export interface CreatePatientBody {
  fullName: string
  phone: string
  email?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
}

export interface UpdatePatientBody {
  fullName?: string
  phone?: string
  email?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
}

export interface FindPatientParams extends core.ParamsDictionary {
  patient_id: string
}

export interface FindPatientByPhoneParams extends core.ParamsDictionary {
  phone: string
}