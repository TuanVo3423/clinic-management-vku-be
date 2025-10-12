import { ObjectId } from 'mongodb'

interface IService {
  _id?: ObjectId
  name: string
  description?: string
  duration: number // in minutes
  price: number
  createdAt?: Date
}

export default class Service {
  _id?: ObjectId
  name: string
  description?: string
  duration: number
  price: number
  createdAt?: Date

  constructor(service: IService) {
    const date = new Date()
    this._id = service._id
    this.name = service.name
    this.description = service.description
    this.duration = service.duration
    this.price = service.price
    this.createdAt = service.createdAt || date
  }
}