import core from 'express-serve-static-core'

export interface CreateBedBody {
  bedNumber: number
  bedName: string
  department?: string
  description?: string
}

export interface UpdateBedBody {
  bedName?: string
  department?: string
  isAvailable?: boolean
  description?: string
}

export interface FindBedParams extends core.ParamsDictionary {
  bed_id: string
}

export interface CheckBedAvailabilityQuery {
  bedId: string
  appointmentDate: string
  appointmentStartTime: string
  appointmentEndTime: string
}
