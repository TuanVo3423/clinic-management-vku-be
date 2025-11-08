import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const createAppointmentValidator = validate(
  checkSchema({
    patientId: {
      notEmpty: {
        errorMessage: 'Patient ID is required'
      },
      isString: {
        errorMessage: 'Patient ID must be a string'
      }
    },
    serviceIds: {
      notEmpty: {
        errorMessage: 'Service IDs are required'
      },
      isArray: {
        errorMessage: 'Service IDs must be an array',
        options: { min: 1 }
      },
      custom: {
        options: (value) => {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('At least one service ID is required')
          }
          if (!value.every((id: any) => typeof id === 'string')) {
            throw new Error('All service IDs must be strings')
          }
          return true
        }
      }
    },
    appointmentDate: {
      notEmpty: {
        errorMessage: 'Appointment date is required'
      },
      isISO8601: {
        errorMessage: 'Appointment date must be a valid date'
      }
    },
    appointmentStartTime: {
      notEmpty: {
        errorMessage: 'Appointment start time is required'
      },
      matches: {
        options: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        errorMessage: 'Appointment start time must be in HH:MM format'
      }
    },
    appointmentEndTime: {
      notEmpty: {
        errorMessage: 'Appointment end time is required'
      },
      matches: {
        options: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        errorMessage: 'Appointment end time must be in HH:MM format'
      },
      custom: {
        options: (value, { req }) => {
          const startTime = req.body.appointmentStartTime
          if (startTime && value) {
            const [startHour, startMinute] = startTime.split(':').map(Number)
            const [endHour, endMinute] = value.split(':').map(Number)
            const startTotalMinutes = startHour * 60 + startMinute
            const endTotalMinutes = endHour * 60 + endMinute

            if (endTotalMinutes <= startTotalMinutes) {
              throw new Error('Appointment end time must be after start time')
            }
          }
          return true
        }
      }
    },
    doctorId: {
      optional: true,
      isString: {
        errorMessage: 'Doctor ID must be a string'
      }
    },
    isEmergency: {
      optional: true,
      isBoolean: {
        errorMessage: 'isEmergency must be a boolean'
      }
    },
    note: {
      optional: true,
      isString: {
        errorMessage: 'Note must be a string'
      }
    }
  })
)

export const updateAppointmentValidator = validate(
  checkSchema({
    doctorId: {
      optional: true,
      isString: {
        errorMessage: 'Doctor ID must be a string'
      }
    },
    serviceIds: {
      optional: true,
      isArray: {
        errorMessage: 'Service IDs must be an array'
      },
      custom: {
        options: (value) => {
          if (value !== undefined && value !== null) {
            if (!Array.isArray(value) || value.length === 0) {
              throw new Error('Service IDs must be a non-empty array')
            }
            if (!value.every((id: any) => typeof id === 'string')) {
              throw new Error('All service IDs must be strings')
            }
          }
          return true
        }
      }
    },
    appointmentDate: {
      optional: true,
      isISO8601: {
        errorMessage: 'Appointment date must be a valid date'
      }
    },
    appointmentStartTime: {
      optional: true,
      matches: {
        options: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        errorMessage: 'Appointment start time must be in HH:MM format'
      }
    },
    appointmentEndTime: {
      optional: true,
      matches: {
        options: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        errorMessage: 'Appointment end time must be in HH:MM format'
      },
      custom: {
        options: (value, { req }) => {
          const startTime = req.body.appointmentStartTime
          if (startTime && value) {
            const [startHour, startMinute] = startTime.split(':').map(Number)
            const [endHour, endMinute] = value.split(':').map(Number)
            const startTotalMinutes = startHour * 60 + startMinute
            const endTotalMinutes = endHour * 60 + endMinute

            if (endTotalMinutes <= startTotalMinutes) {
              throw new Error('Appointment end time must be after start time')
            }
          }
          return true
        }
      }
    },
    status: {
      optional: true,
      isIn: {
        options: [['pending', 'confirmed', 'cancelled', 'completed']],
        errorMessage: 'Status must be one of: pending, confirmed, cancelled, completed'
      }
    },
    isEmergency: {
      optional: true,
      isBoolean: {
        errorMessage: 'isEmergency must be a boolean'
      }
    },
    note: {
      optional: true,
      isString: {
        errorMessage: 'Note must be a string'
      }
    }
  })
)
