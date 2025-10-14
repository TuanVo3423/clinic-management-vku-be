import { Router } from 'express'
import {
  createBedController,
  getBedsController,
  getBedController,
  updateBedController,
  deleteBedController,
  checkBedAvailabilityController,
  getAvailableBedsController,
  getBedAppointmentsController
} from '~/controllers/beds.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const bedsRouter = Router()

/**
 * Description: Create a new bed
 * Path: /beds
 * Method: POST
 * Body: { bedNumber: number, bedName: string, department?: string, description?: string }
 */
bedsRouter.post('/', wrapRequestHandler(createBedController))

/**
 * Description: Get all beds
 * Path: /beds
 * Method: GET
 */
bedsRouter.get('/', wrapRequestHandler(getBedsController))

/**
 * Description: Get available beds for a specific date and time
 * Path: /beds/available
 * Method: GET
 * Query: { appointmentDate: string, appointmentStartTime: string, appointmentEndTime: string }
 */
bedsRouter.get('/available', wrapRequestHandler(getAvailableBedsController))

/**
 * Description: Check bed availability
 * Path: /beds/check-availability
 * Method: GET
 * Query: { bedId: string, appointmentDate: string, appointmentStartTime: string, appointmentEndTime: string }
 */
bedsRouter.get('/check-availability', wrapRequestHandler(checkBedAvailabilityController))

/**
 * Description: Get a bed by id
 * Path: /beds/:bed_id
 * Method: GET
 */
bedsRouter.get('/:bed_id', getBedController as any)

/**
 * Description: Update a bed
 * Path: /beds/:bed_id
 * Method: PUT
 * Body: { bedName?: string, department?: string, isAvailable?: boolean, description?: string }
 */
bedsRouter.put('/:bed_id', updateBedController as any)

/**
 * Description: Delete a bed
 * Path: /beds/:bed_id
 * Method: DELETE
 */
bedsRouter.delete('/:bed_id', deleteBedController as any)

/**
 * Description: Get all appointments for a specific bed
 * Path: /beds/:bed_id/appointments
 * Method: GET
 */
bedsRouter.get('/:bed_id/appointments', getBedAppointmentsController as any)

export default bedsRouter
