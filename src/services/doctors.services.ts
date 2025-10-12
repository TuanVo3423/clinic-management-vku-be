import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreateDoctorBody, UpdateDoctorBody } from '~/models/requests/doctors.request'
import Doctor from '~/models/schemas/Doctor.schema'

class DoctorsServices {
  async createDoctor(payload: CreateDoctorBody) {
    const doctor = await databaseServices.doctors.insertOne(
      new Doctor(payload)
    )
    return doctor
  }

  async getDoctors() {
    const doctors = await databaseServices.doctors.find({}).toArray()
    return doctors
  }

  async getDoctor(_id: string) {
    const doctor = await databaseServices.doctors.findOne({ _id: new ObjectId(_id) })
    return doctor
  }

  async getAvailableDoctors(day: number) {
    // Lấy danh sách bác sĩ làm việc trong ngày cụ thể
    const doctors = await databaseServices.doctors.find({ 
      workingDays: { $in: [day] } 
    }).toArray()
    return doctors
  }

  async updateDoctor(_id: string, payload: UpdateDoctorBody) {
    const doctor = await databaseServices.doctors.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: payload
      }
    )
    return doctor
  }

  async deleteDoctor(_id: string) {
    const doctor = await databaseServices.doctors.deleteOne({ _id: new ObjectId(_id) })
    return doctor
  }
}

const doctorsServices = new DoctorsServices()
export default doctorsServices