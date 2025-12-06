import { Collection, Db, MongoClient } from 'mongodb'
import Patient from '~/models/schemas/Patient.schema'
import Doctor from '~/models/schemas/Doctor.schema'
import Service from '~/models/schemas/Service.schema'
import Appointment from '~/models/schemas/Appointment.schema'
import Notification from '~/models/schemas/Notification.schema'
import Bed from '~/models/schemas/Bed.schema'
import Otp from '~/models/schemas/Otp.schema'

class DatabaseServices {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(process.env.DB_URL as string)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  getDB(): Db {
    return this.db
  }

  get patients(): Collection<Patient> {
    return this.db.collection(process.env.DB_PATIENTS_COLLECTION as string)
  }

  get doctors(): Collection<Doctor> {
    return this.db.collection(process.env.DB_DOCTORS_COLLECTION as string)
  }

  get services(): Collection<Service> {
    return this.db.collection(process.env.DB_SERVICES_COLLECTION as string)
  }

  get appointments(): Collection<Appointment> {
    return this.db.collection(process.env.DB_APPOINTMENTS_COLLECTION as string)
  }

  get notifications(): Collection<Notification> {
    return this.db.collection(process.env.DB_NOTIFICATIONS_COLLECTION as string)
  }

  get beds(): Collection<Bed> {
    return this.db.collection(process.env.DB_BEDS_COLLECTION as string)
  }

  get otps(): Collection<Otp> {
    return this.db.collection(process.env.DB_OTPS_COLLECTION || 'otps')
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
