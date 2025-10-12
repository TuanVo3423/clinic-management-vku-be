import core from 'express-serve-static-core'

export interface CreateDoctorBody {
  name: string
  specialization?: string
  phone?: string
  email?: string
  workingDays: number[]
  startTime: string
  endTime: string
}

export interface UpdateDoctorBody {
  name?: string
  specialization?: string
  phone?: string
  email?: string
  workingDays?: number[]
  startTime?: string
  endTime?: string
}

export interface FindDoctorParams extends core.ParamsDictionary {
  doctor_id: string
}