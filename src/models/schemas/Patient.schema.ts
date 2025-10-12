import { ObjectId } from 'mongodb'

interface IPatient {
  _id?: ObjectId
  fullName: string
  phone: string
  email?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  createdAt?: Date
  updatedAt?: Date
}

export default class Patient {
  _id?: ObjectId
  fullName: string
  phone: string
  email?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  createdAt?: Date
  updatedAt?: Date

  constructor(patient: IPatient) {
    const date = new Date()
    this._id = patient._id
    this.fullName = patient.fullName
    this.phone = patient.phone
    this.email = patient.email
    this.dateOfBirth = patient.dateOfBirth
    this.gender = patient.gender
    this.createdAt = patient.createdAt || date
    this.updatedAt = patient.updatedAt || date
  }
}