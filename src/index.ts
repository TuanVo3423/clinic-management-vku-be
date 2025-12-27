import bodyParser from 'body-parser'
import { v2 as cloudinary } from 'cloudinary'
import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
config()
import { defaultErrorHandler } from './middlewares/error.middlewares'
import patientsRouter from './routes/patients.routes'
import doctorsRouter from './routes/doctors.routes'
import servicesRouter from './routes/services.routes'
import appointmentsRouter from './routes/appointments.routes'
import notificationsRouter from './routes/notifications.routes'
import bedsRouter from './routes/beds.routes'
import chatbotRouter from './routes/chatbot.routes'
import adminChatbotRouter from './routes/admin-chatbot.routes'
import otpRouter from './routes/otp.routes'
import databaseServices from './services/database.services'
import socketService from './services/socket.services'

// 👇 import watcher
import { watchAppointments } from './watchers/appointmentWatcher'
import { watchNotifications } from './watchers/notificationWatcher'

const app = express()
const port = 3000

app.use(cors({ origin: 'https://clinic-management-vku.vercel.app', credentials: true }))
app.use(bodyParser.json({ limit: '30mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }))
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use(express.json())
app.use('/otp', otpRouter)
app.use('/patients', patientsRouter)
app.use('/doctors', doctorsRouter)
app.use('/services', servicesRouter)
app.use('/appointments', appointmentsRouter)
app.use('/notifications', notificationsRouter)
app.use('/beds', bedsRouter)
app.use('/chatbot', chatbotRouter)
app.use('/admin-chatbot', adminChatbotRouter)
app.use(defaultErrorHandler)

const server = app.listen(port, async () => {
  console.log(`✅ Server running on port ${port}`)

  try {
    await databaseServices.connect()
    console.log('✅ Connected to MongoDB')

    // 👇 Khởi tạo Socket.IO
    socketService.initialize(server)

    // 👇 Bắt đầu lắng nghe sự kiện thêm mới
    watchAppointments()
    watchNotifications()
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error)
  }
})
