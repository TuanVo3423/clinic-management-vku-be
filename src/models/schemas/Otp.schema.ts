import { ObjectId } from 'mongodb'

interface IOtp {
  _id?: ObjectId
  email: string
  phone: string
  code: string
  purpose: 'create_patient' | 'get_patient_by_phone'
  expiresAt: Date
  verified: boolean
  createdAt?: Date
}

export default class Otp {
  _id?: ObjectId
  email: string
  phone: string
  code: string
  purpose: 'create_patient' | 'get_patient_by_phone'
  expiresAt: Date
  verified: boolean
  createdAt?: Date

  constructor(otp: IOtp) {
    const date = new Date()
    this._id = otp._id
    this.email = otp.email
    this.phone = otp.phone
    this.code = otp.code
    this.purpose = otp.purpose
    this.expiresAt = otp.expiresAt
    this.verified = otp.verified || false
    this.createdAt = otp.createdAt || date
  }
}
