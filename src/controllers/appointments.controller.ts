import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateAppointmentBody,
  FindAppointmentParams,
  UpdateAppointmentBody,
  FindAppointmentsByPatientParams,
  FindAppointmentsByDoctorParams
} from '~/models/requests/appointments.request'
import appointmentsServices from '~/services/appointments.services'
import patientsServices from '~/services/patients.services'

const APPOINTMENTS_MESSAGES = {
  CREATE_APPOINTMENT_SUCCESS: 'Create appointment successfully',
  GET_APPOINTMENTS_SUCCESS: 'Get appointments successfully',
  GET_APPOINTMENT_SUCCESS: 'Get appointment successfully',
  UPDATE_APPOINTMENT_SUCCESS: 'Update appointment successfully',
  DELETE_APPOINTMENT_SUCCESS: 'Delete appointment successfully',
  CANCEL_APPOINTMENT_SUCCESS: 'Cancel appointment successfully',
  CONFIRM_APPOINTMENT_SUCCESS: 'Appointment confirmed successfully',
  APPOINTMENT_PENDING_SUCCESS: 'Appointment status updated to pending successfully',
  APPOINTMENT_CANCELLED_SUCCESS: 'Appointment cancelled successfully',
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  PATIENT_NOT_FOUND: 'Patient not found',
  GET_APPOINTMENTS_BY_DATE_SUCCESS: 'Get appointments by date successfully',
  GET_EMERGENCY_APPOINTMENTS_SUCCESS: 'Get emergency appointments successfully',
  INVALID_STATUS: 'Invalid status. Status must be one of: pending, confirmed, cancelled',
  STATUS_REQUIRED: 'Status is required'
}

export const createAppointmentController = async (
  req: Request<ParamsDictionary, any, CreateAppointmentBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Kiểm tra bệnh nhân có tồn tại không
    const patient = await patientsServices.getPatient(req.body.patientId)
    if (!patient) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.PATIENT_NOT_FOUND })
    }

    // Kiểm tra xung đột thời gian nếu có doctorId
    if (req.body.doctorId) {
      const conflictCheck = await appointmentsServices.checkTimeConflict(
        req.body.doctorId,
        new Date(req.body.appointmentDate),
        req.body.appointmentStartTime,
        req.body.appointmentEndTime
      )

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          message: 'Bác sĩ đã có lịch hẹn trong khoảng thời gian này',
          conflictingAppointment: conflictCheck.conflictingAppointment
        })
      }
    }

    // Kiểm tra xung đột giường bệnh nếu có bedId
    if (req.body.bedId) {
      const bedConflictCheck = await appointmentsServices.checkBedConflict(
        req.body.bedId,
        new Date(req.body.appointmentDate),
        req.body.appointmentStartTime,
        req.body.appointmentEndTime
      )

      if (bedConflictCheck.hasConflict) {
        return res.status(409).json({
          message: 'Giường bệnh đã được đặt trong khoảng thời gian này',
          conflictingAppointment: bedConflictCheck.conflictingAppointment
        })
      }
    }

    const appointment = await appointmentsServices.createAppointment(req.body)
    return res.status(201).json({
      message: APPOINTMENTS_MESSAGES.CREATE_APPOINTMENT_SUCCESS,
      appointment_id: appointment.insertedId
    })
  } catch (error) {
    next(error)
  }
}

export const confirmAppointmentController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const { appointment_id } = req.params
    const { status } = req.body

    // Validate status parameter
    const validStatuses = ['pending', 'confirmed', 'cancelled']
    if (!status) {
      return res.status(400).json({ message: APPOINTMENTS_MESSAGES.STATUS_REQUIRED })
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: APPOINTMENTS_MESSAGES.INVALID_STATUS
      })
    }

    // Check if appointment exists
    const existingAppointment = await appointmentsServices.getAppointment(appointment_id)
    if (!existingAppointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }

    // Update appointment status
    const updatedAppointment = await appointmentsServices.updateAppointment(
      appointment_id,
      { status },
      'doctor' // Assuming doctor is confirming the appointment
    )

    // Prepare response message based on status
    let message = ''
    switch (status) {
      case 'confirmed':
        message = APPOINTMENTS_MESSAGES.CONFIRM_APPOINTMENT_SUCCESS
        break
      case 'cancelled':
        message = APPOINTMENTS_MESSAGES.APPOINTMENT_CANCELLED_SUCCESS
        break
      case 'pending':
        message = APPOINTMENTS_MESSAGES.APPOINTMENT_PENDING_SUCCESS
        break
    }

    return res.json({
      message,
      appointment: updatedAppointment
    })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getAppointments()
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentsServices.getAppointment(req.params.appointment_id)
    if (!appointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENT_SUCCESS, appointment })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByPatientController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getAppointmentsByPatient(req.params.patient_id)
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByDoctorController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getAppointmentsByDoctor(req.params.doctor_id)
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByDateController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' })
    }

    const appointmentDate = new Date(date as string)
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    const appointments = await appointmentsServices.getAppointmentsByDate(appointmentDate)
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_APPOINTMENTS_BY_DATE_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByTimeRangeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, doctorId, patientId } = req.query

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Both startDate and endDate parameters are required',
        example: '?startDate=2023-10-14T09:00:00Z&endDate=2023-10-14T17:00:00Z'
      })
    }

    console.log('startDate before convert to Date', startDate)
    console.log('endDate before convert to Date', endDate)

    const startDateTime = new Date(startDate as string)
    const endDateTime = new Date(endDate as string)
    startDateTime.setHours(startDateTime.getHours() + 7)
    endDateTime.setHours(endDateTime.getHours() + 7)
    console.log('startDateTime', startDateTime)
    console.log('endDateTime', endDateTime)

    // Validate date formats
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
        example: '2023-10-14T09:00:00Z'
      })
    }

    // Validate date range
    if (startDateTime >= endDateTime) {
      return res.status(400).json({
        message: 'Start date must be before end date'
      })
    }

    const appointments = await appointmentsServices.getAppointmentsByTimeRange(
      startDateTime,
      endDateTime,
      doctorId as string,
      patientId as string
    )

    return res.json({
      message: 'Get appointments by time range successfully',
      appointments,
      filters: {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        doctorId: doctorId || null,
        patientId: patientId || null
      },
      total: appointments.length
    })
  } catch (error) {
    next(error)
  }
}

export const getEmergencyAppointmentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await appointmentsServices.getEmergencyAppointments()
    return res.json({ message: APPOINTMENTS_MESSAGES.GET_EMERGENCY_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}

export const updateAppointmentController = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  try {
    const existingAppointment = await appointmentsServices.getAppointment(req.params.appointment_id)
    if (!existingAppointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }

    // Kiểm tra xung đột thời gian nếu cập nhật thời gian hoặc bác sĩ
    const doctorId = req.body.doctorId || existingAppointment.doctorId
    const appointmentDate = req.body.appointmentDate
      ? new Date(req.body.appointmentDate)
      : existingAppointment.appointmentDate
    const startTime = req.body.appointmentStartTime || existingAppointment.appointmentStartTime
    const endTime = req.body.appointmentEndTime || existingAppointment.appointmentEndTime

    if (
      doctorId &&
      (req.body.doctorId || req.body.appointmentDate || req.body.appointmentStartTime || req.body.appointmentEndTime)
    ) {
      const conflictCheck = await appointmentsServices.checkTimeConflict(
        doctorId.toString(),
        appointmentDate,
        startTime,
        endTime,
        req.params.appointment_id
      )

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          message: 'Bác sĩ đã có lịch hẹn trong khoảng thời gian này',
          conflictingAppointment: conflictCheck.conflictingAppointment
        })
      }
    }

    const appointment = await appointmentsServices.updateAppointment(req.params.appointment_id, req.body, 'system')
    return res.json({ message: APPOINTMENTS_MESSAGES.UPDATE_APPOINTMENT_SUCCESS, appointment })
  } catch (error) {
    next(error)
  }
}

export const updateAppointmentForClientController = async (
  req: Request<any, any, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { appointment_id } = req.params
    const updateData = req.body

    // Kiểm tra xem lịch hẹn có tồn tại không
    const existingAppointment = await appointmentsServices.getAppointment(appointment_id)
    if (!existingAppointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }

    // Kiểm tra status của lịch hẹn - chỉ cho phép update khi status là pending
    if (existingAppointment.status !== 'pending') {
      return res.status(403).json({
        message: 'Chỉ có thể cập nhật lịch hẹn ở trạng thái đang chờ (pending)',
        currentStatus: existingAppointment.status
      })
    }

    // Kiểm tra xung đột thời gian nếu cập nhật thời gian hoặc bác sĩ
    const doctorId = updateData.doctorId || existingAppointment.doctorId
    const appointmentDate = updateData.appointmentDate
      ? new Date(updateData.appointmentDate)
      : existingAppointment.appointmentDate
    const startTime = updateData.appointmentStartTime || existingAppointment.appointmentStartTime
    const endTime = updateData.appointmentEndTime || existingAppointment.appointmentEndTime

    // Kiểm tra xung đột với bác sĩ nếu có thay đổi về thời gian/ngày/bác sĩ
    if (
      doctorId &&
      (updateData.doctorId ||
        updateData.appointmentDate ||
        updateData.appointmentStartTime ||
        updateData.appointmentEndTime)
    ) {
      const conflictCheck = await appointmentsServices.checkTimeConflict(
        doctorId.toString(),
        appointmentDate,
        startTime,
        endTime,
        appointment_id
      )

      if (conflictCheck.hasConflict) {
        return res.status(409).json({
          message: 'Bác sĩ đã có lịch hẹn trong khoảng thời gian này',
          conflictingAppointment: conflictCheck.conflictingAppointment
        })
      }
    }

    // Kiểm tra xung đột giường bệnh nếu có thay đổi
    const bedId = updateData.bedId || existingAppointment.bedId
    if (
      bedId &&
      (updateData.bedId ||
        updateData.appointmentDate ||
        updateData.appointmentStartTime ||
        updateData.appointmentEndTime)
    ) {
      const bedConflictCheck = await appointmentsServices.checkBedConflict(
        bedId.toString(),
        appointmentDate,
        startTime,
        endTime,
        appointment_id
      )

      if (bedConflictCheck.hasConflict) {
        return res.status(409).json({
          message: 'Giường bệnh đã được đặt trong khoảng thời gian này',
          conflictingAppointment: bedConflictCheck.conflictingAppointment
        })
      }
    }

    // Cập nhật lịch hẹn với updatedBy là 'patient'
    const appointment = await appointmentsServices.updateAppointment(appointment_id, updateData, 'patient')

    return res.json({
      message: APPOINTMENTS_MESSAGES.UPDATE_APPOINTMENT_SUCCESS,
      appointment
    })
  } catch (error) {
    next(error)
  }
}

export const cancelAppointmentController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const existingAppointment = await appointmentsServices.getAppointment(req.params.appointment_id)
    if (!existingAppointment) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }

    const appointment = await appointmentsServices.cancelAppointment(req.params.appointment_id, 'system')
    return res.json({ message: APPOINTMENTS_MESSAGES.CANCEL_APPOINTMENT_SUCCESS, appointment })
  } catch (error) {
    next(error)
  }
}

export const deleteAppointmentController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentsServices.deleteAppointment(req.params.appointment_id)
    if (appointment.deletedCount === 0) {
      return res.status(404).json({ message: APPOINTMENTS_MESSAGES.APPOINTMENT_NOT_FOUND })
    }
    return res.json({ message: APPOINTMENTS_MESSAGES.DELETE_APPOINTMENT_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const getAppointmentsByStatusController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query

    // Validate status parameter
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!status) {
      return res.status(400).json({ message: 'Status is required' })
    }

    if (!validStatuses.includes(status as string)) {
      return res.status(400).json({
        message: 'Invalid status. Status must be one of: pending, confirmed, cancelled, completed'
      })
    }

    const appointments = await appointmentsServices.getAppointmentsByStatus(status as any)
    return res.json({
      message: 'Get appointments by status successfully',
      appointments
    })
  } catch (error) {
    next(error)
  }
}
