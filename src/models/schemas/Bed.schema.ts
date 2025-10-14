import { ObjectId } from 'mongodb'

interface IBed {
  _id?: ObjectId
  bedNumber: number
  bedName: string
  department?: string
  isAvailable: boolean
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Bed {
  _id?: ObjectId
  bedNumber: number
  bedName: string
  department?: string
  isAvailable: boolean
  description?: string
  createdAt?: Date
  updatedAt?: Date

  constructor(bed: IBed) {
    const date = new Date()
    this._id = bed._id
    this.bedNumber = bed.bedNumber
    this.bedName = bed.bedName
    this.department = bed.department
    this.isAvailable = bed.isAvailable !== undefined ? bed.isAvailable : true
    this.description = bed.description
    this.createdAt = bed.createdAt || date
    this.updatedAt = bed.updatedAt || date
  }
}
