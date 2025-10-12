import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreatePatientBody, UpdatePatientBody } from '~/models/requests/patients.request'
import Patient from '~/models/schemas/Patient.schema'

class PatientsServices {
  async createPatient(payload: CreatePatientBody) {
    const patientData = {
      ...payload,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined
    }
    
    const patient = await databaseServices.patients.insertOne(
      new Patient(patientData as any)
    )
    return patient
  }

  async getPatients() {
    const patients = await databaseServices.patients.find({}).toArray()
    return patients
  }

  async getPatient(_id: string) {
    const patient = await databaseServices.patients.findOne({ _id: new ObjectId(_id) })
    return patient
  }

  async getPatientByPhone(phone: string) {
    const patient = await databaseServices.patients.findOne({ phone })
    return patient
  }

  async updatePatient(_id: string, payload: UpdatePatientBody) {
    const updateData: any = { ...payload }
    if (payload.dateOfBirth) {
      updateData.dateOfBirth = new Date(payload.dateOfBirth)
    }
    updateData.updatedAt = new Date()

    const patient = await databaseServices.patients.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: updateData
      }
    )
    return patient
  }

  async deletePatient(_id: string) {
    const patient = await databaseServices.patients.deleteOne({ _id: new ObjectId(_id) })
    return patient
  }

  async findOrCreatePatient(patientData: CreatePatientBody) {
    // Tìm bệnh nhân theo số điện thoại
    let patient = await this.getPatientByPhone(patientData.phone)
    
    if (!patient) {
      // Nếu không tìm thấy, tạo mới
      const result = await this.createPatient(patientData)
      patient = await this.getPatient(result.insertedId.toString())
    }
    
    return patient
  }
}

const patientsServices = new PatientsServices()
export default patientsServices