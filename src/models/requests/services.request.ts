import core from 'express-serve-static-core'

export interface CreateServiceBody {
  name: string
  description?: string
  duration: number
  price: number
}

export interface UpdateServiceBody {
  name?: string
  description?: string
  duration?: number
  price?: number
}

export interface FindServiceParams extends core.ParamsDictionary {
  service_id: string
}