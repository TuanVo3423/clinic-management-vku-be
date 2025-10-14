import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateBedBody, UpdateBedBody, FindBedParams, CheckBedAvailabilityQuery } from '~/models/requests/beds.request'
import bedsServices from '~/services/beds.services'

const BEDS_MESSAGES = {
  CREATE_BED_SUCCESS: 'Create bed successfully',
  GET_BEDS_SUCCESS: 'Get beds successfully',
  GET_BED_SUCCESS: 'Get bed successfully',
  UPDATE_BED_SUCCESS: 'Update bed successfully',
  DELETE_BED_SUCCESS: 'Delete bed successfully',
  BED_NOT_FOUND: 'Bed not found',
  BED_AVAILABLE: 'Bed is available',
  BED_NOT_AVAILABLE: 'Bed is not available',
  GET_AVAILABLE_BEDS_SUCCESS: 'Get available beds successfully',
  GET_BED_APPOINTMENTS_SUCCESS: 'Get bed appointments successfully'
}

export const createBedController = async (
  req: Request<ParamsDictionary, any, CreateBedBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const bed = await bedsServices.createBed(req.body)
    return res.status(201).json({
      message: BEDS_MESSAGES.CREATE_BED_SUCCESS,
      bed_id: bed.insertedId
    })
  } catch (error: any) {
    if (error.message === 'Bed number already exists') {
      return res.status(409).json({ message: error.message })
    }
    next(error)
  }
}

export const getBedsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const beds = await bedsServices.getBeds()
    return res.json({ message: BEDS_MESSAGES.GET_BEDS_SUCCESS, beds })
  } catch (error) {
    next(error)
  }
}

export const getAvailableBedsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentDate, appointmentStartTime, appointmentEndTime } = req.query

    if (!appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      return res.status(400).json({
        message: 'appointmentDate, appointmentStartTime, and appointmentEndTime are required'
      })
    }

    const beds = await bedsServices.getAvailableBeds(
      new Date(appointmentDate as string),
      appointmentStartTime as string,
      appointmentEndTime as string
    )
    return res.json({ message: BEDS_MESSAGES.GET_AVAILABLE_BEDS_SUCCESS, beds })
  } catch (error) {
    next(error)
  }
}

export const getBedController = async (req: Request<FindBedParams>, res: Response, next: NextFunction) => {
  try {
    const bed = await bedsServices.getBed(req.params.bed_id)
    if (!bed) {
      return res.status(404).json({ message: BEDS_MESSAGES.BED_NOT_FOUND })
    }
    return res.json({ message: BEDS_MESSAGES.GET_BED_SUCCESS, bed })
  } catch (error) {
    next(error)
  }
}

export const updateBedController = async (
  req: Request<FindBedParams, any, UpdateBedBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const bed = await bedsServices.updateBed(req.params.bed_id, req.body)
    if (bed.matchedCount === 0) {
      return res.status(404).json({ message: BEDS_MESSAGES.BED_NOT_FOUND })
    }
    return res.json({ message: BEDS_MESSAGES.UPDATE_BED_SUCCESS })
  } catch (error) {
    next(error)
  }
}

export const deleteBedController = async (req: Request<FindBedParams>, res: Response, next: NextFunction) => {
  try {
    const bed = await bedsServices.deleteBed(req.params.bed_id)
    if (bed.deletedCount === 0) {
      return res.status(404).json({ message: BEDS_MESSAGES.BED_NOT_FOUND })
    }
    return res.json({ message: BEDS_MESSAGES.DELETE_BED_SUCCESS })
  } catch (error: any) {
    if (error.message === 'Cannot delete bed with active appointments') {
      return res.status(409).json({ message: error.message })
    }
    next(error)
  }
}

export const checkBedAvailabilityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bedId, appointmentDate, appointmentStartTime, appointmentEndTime } = req.query

    if (!bedId || !appointmentDate || !appointmentStartTime || !appointmentEndTime) {
      return res.status(400).json({
        message: 'bedId, appointmentDate, appointmentStartTime, and appointmentEndTime are required'
      })
    }

    const result = await bedsServices.checkBedAvailability(
      bedId as string,
      new Date(appointmentDate as string),
      appointmentStartTime as string,
      appointmentEndTime as string
    )

    if (result.available) {
      return res.json({ message: BEDS_MESSAGES.BED_AVAILABLE, available: true })
    } else {
      return res.json({
        message: BEDS_MESSAGES.BED_NOT_AVAILABLE,
        available: false,
        reason: result.reason,
        conflictingAppointment: result.conflictingAppointment
      })
    }
  } catch (error) {
    next(error)
  }
}

export const getBedAppointmentsController = async (req: Request<FindBedParams>, res: Response, next: NextFunction) => {
  try {
    const appointments = await bedsServices.getBedAppointments(req.params.bed_id)
    return res.json({ message: BEDS_MESSAGES.GET_BED_APPOINTMENTS_SUCCESS, appointments })
  } catch (error) {
    next(error)
  }
}
