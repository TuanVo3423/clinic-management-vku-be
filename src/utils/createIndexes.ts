import databaseServices from '../services/database.services'

// Script để tạo indexes cho hệ thống phòng khám Đông y
async function createIndexes() {
  try {
    console.log('Creating indexes for clinic management system...')

    // Index cho patients collection
    await databaseServices.patients.createIndex({ phone: 1 }, { unique: true })
    await databaseServices.patients.createIndex({ email: 1 })
    await databaseServices.patients.createIndex({ fullName: 'text' })
    console.log('✓ Patients indexes created')

    // Index cho doctors collection
    await databaseServices.doctors.createIndex({ name: 'text' })
    await databaseServices.doctors.createIndex({ specialization: 1 })
    await databaseServices.doctors.createIndex({ workingDays: 1 })
    await databaseServices.doctors.createIndex({ email: 1 })
    await databaseServices.doctors.createIndex({ phone: 1 })
    console.log('✓ Doctors indexes created')

    // Index cho services collection
    await databaseServices.services.createIndex({ name: 'text' })
    await databaseServices.services.createIndex({ price: 1 })
    await databaseServices.services.createIndex({ duration: 1 })
    console.log('✓ Services indexes created')

    // Index cho appointments collection
    await databaseServices.appointments.createIndex({ patientId: 1 })
    await databaseServices.appointments.createIndex({ doctorId: 1 })
    await databaseServices.appointments.createIndex({ serviceId: 1 })
    await databaseServices.appointments.createIndex({ appointmentDate: 1 })
    await databaseServices.appointments.createIndex({ status: 1 })
    await databaseServices.appointments.createIndex({ isEmergency: 1 })
    await databaseServices.appointments.createIndex({ createdAt: -1 })
    // Compound index cho tìm kiếm theo ngày và trạng thái
    await databaseServices.appointments.createIndex({ appointmentDate: 1, status: 1 })
    // Compound index cho tìm kiếm theo bệnh nhân và ngày
    await databaseServices.appointments.createIndex({ patientId: 1, appointmentDate: -1 })
    // Compound index cho tìm kiếm theo bác sĩ và ngày
    await databaseServices.appointments.createIndex({ doctorId: 1, appointmentDate: 1 })
    console.log('✓ Appointments indexes created')

    // Index cho notifications collection
    await databaseServices.notifications.createIndex({ recipientId: 1 })
    await databaseServices.notifications.createIndex({ recipientType: 1 })
    await databaseServices.notifications.createIndex({ type: 1 })
    await databaseServices.notifications.createIndex({ status: 1 })
    await databaseServices.notifications.createIndex({ channel: 1 })
    await databaseServices.notifications.createIndex({ createdAt: -1 })
    // Compound index cho tìm thông báo theo người nhận
    await databaseServices.notifications.createIndex({ recipientId: 1, recipientType: 1, createdAt: -1 })
    // Index cho tìm thông báo thất bại
    await databaseServices.notifications.createIndex({ status: 1, createdAt: -1 })
    console.log('✓ Notifications indexes created')

    console.log('All indexes created successfully!')
  } catch (error) {
    console.error('Error creating indexes:', error)
  }
}

export default createIndexes