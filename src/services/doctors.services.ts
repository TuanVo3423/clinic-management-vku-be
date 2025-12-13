import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import {
  CreateDoctorBody,
  LoginDoctorBody,
  RegisterDoctorBody,
  UpdateDoctorBody
} from '~/models/requests/doctors.request'
import Doctor from '~/models/schemas/Doctor.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'

class DoctorsServices {
  async createDoctor(payload: CreateDoctorBody) {
    // Hash password nếu có
    if (payload.password) {
      payload.password = hashPassword(payload.password)
    }

    const doctor = await databaseServices.doctors.insertOne(new Doctor(payload))
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

  async getDoctorByEmail(email: string) {
    const doctor = await databaseServices.doctors.findOne({ email })
    return doctor
  }

  async getAvailableDoctors(day: number) {
    // Lấy danh sách bác sĩ làm việc trong ngày cụ thể
    const doctors = await databaseServices.doctors
      .find({
        workingDays: { $in: [day] }
      })
      .toArray()
    return doctors
  }

  async getFirstDoctor() {
    const doctor = await databaseServices.doctors.findOne({})
    return doctor
  }

  async updateDoctor(_id: string, payload: UpdateDoctorBody) {
    // Hash password nếu có cập nhật password
    if (payload.password) {
      payload.password = hashPassword(payload.password)
    }

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

  async register(payload: RegisterDoctorBody) {
    const { email, password, name, specialization, phone, workingDays, startTime, endTime } = payload

    // Kiểm tra email đã tồn tại chưa
    const existingDoctor = await this.getDoctorByEmail(email)
    if (existingDoctor) {
      throw new Error('Email đã được sử dụng')
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Tạo doctor mới
    const newDoctor = await databaseServices.doctors.insertOne(
      new Doctor({
        name,
        email,
        password: hashedPassword,
        specialization,
        phone,
        workingDays,
        startTime,
        endTime
      })
    )

    // Tạo access token và refresh token
    const [accessToken, refreshToken] = await Promise.all([
      signToken({
        payload: {
          doctor_id: newDoctor.insertedId.toString(),
          email: email
        },
        privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
        options: {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        }
      }),
      signToken({
        payload: {
          doctor_id: newDoctor.insertedId.toString(),
          email: email
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
        options: {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        }
      })
    ])

    return {
      accessToken,
      refreshToken,
      doctor: {
        _id: newDoctor.insertedId,
        name,
        email,
        specialization,
        phone,
        workingDays,
        startTime,
        endTime
      }
    }
  }

  async login(payload: LoginDoctorBody) {
    const { email, password } = payload

    // Tìm bác sĩ theo email
    const doctor = await this.getDoctorByEmail(email)

    if (!doctor) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }

    // Kiểm tra password
    const hashedPassword = hashPassword(password)
    if (doctor.password !== hashedPassword) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }

    // Tạo access token và refresh token
    const [accessToken, refreshToken] = await Promise.all([
      signToken({
        payload: {
          doctor_id: doctor._id?.toString(),
          email: doctor.email
        },
        privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
        options: {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        }
      }),
      signToken({
        payload: {
          doctor_id: doctor._id?.toString(),
          email: doctor.email
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
        options: {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        }
      })
    ])

    return {
      accessToken,
      refreshToken,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone,
        workingDays: doctor.workingDays,
        startTime: doctor.startTime,
        endTime: doctor.endTime
      }
    }
  }
}

const doctorsServices = new DoctorsServices()
export default doctorsServices
