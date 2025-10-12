import { ObjectId } from 'mongodb'

interface IDoctor {
  _id?: ObjectId
  name: string
  specialization?: string
  phone?: string
  email?: string
  workingDays: number[] // 0-6 (0 = Sunday)
  startTime: string // "HH:mm" format
  endTime: string // "HH:mm" format
  createdAt?: Date
}

export default class Doctor {
  _id?: ObjectId
  name: string
  specialization?: string
  phone?: string
  email?: string
  workingDays: number[]
  startTime: string
  endTime: string
  createdAt?: Date

  constructor(doctor: IDoctor) {
    const date = new Date()
    this._id = doctor._id
    this.name = doctor.name
    this.specialization = doctor.specialization
    this.phone = doctor.phone
    this.email = doctor.email
    this.workingDays = doctor.workingDays
    this.startTime = doctor.startTime
    this.endTime = doctor.endTime
    this.createdAt = doctor.createdAt || date
  }
}