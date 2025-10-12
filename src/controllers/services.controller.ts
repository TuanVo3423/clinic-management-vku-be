import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateServiceBody, FindServiceParams, UpdateServiceBody } from '~/models/requests/services.request'
import servicesServices from '~/services/services.services'

const SERVICES_MESSAGES = {
  CREATE_SERVICE_SUCCESS: 'Create service successfully',
  GET_SERVICES_SUCCESS: 'Get services successfully',
  GET_SERVICE_SUCCESS: 'Get service successfully',
  UPDATE_SERVICE_SUCCESS: 'Update service successfully',
  DELETE_SERVICE_SUCCESS: 'Delete service successfully',
  SERVICE_NOT_FOUND: 'Service not found'
}

export const createServiceController = async (
  req: Request<ParamsDictionary, any, CreateServiceBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = await servicesServices.createService(req.body)
    return res.status(201).json({ 
      message: SERVICES_MESSAGES.CREATE_SERVICE_SUCCESS, 
      service_id: service.insertedId 
    })
  } catch (error) {
    next(error)
  }
}

export const getServicesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { minPrice, maxPrice } = req.query
    
    let services
    if (minPrice && maxPrice) {
      services = await servicesServices.getServicesByPriceRange(
        parseFloat(minPrice as string), 
        parseFloat(maxPrice as string)
      )
    } else {
      services = await servicesServices.getServices()
    }
    
    return res.json({ message: SERVICES_MESSAGES.GET_SERVICES_SUCCESS, services })
  } catch (error) {
    next(error)
  }
}

export const getServiceController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const service = await servicesServices.getService(req.params.service_id)
    if (!service) {
      return res.status(404).json({ message: SERVICES_MESSAGES.SERVICE_NOT_FOUND })
    }
    return res.json({ message: SERVICES_MESSAGES.GET_SERVICE_SUCCESS, service })
  } catch (error) {
    next(error)
  }
}

export const updateServiceController = async (req: Request<any, any, any>, res: Response, next: NextFunction) => {
  try {
    const existingService = await servicesServices.getService(req.params.service_id)
    if (!existingService) {
      return res.status(404).json({ message: SERVICES_MESSAGES.SERVICE_NOT_FOUND })
    }

    const service = await servicesServices.updateService(req.params.service_id, req.body)
    return res.json({ message: SERVICES_MESSAGES.UPDATE_SERVICE_SUCCESS, service })
  } catch (error) {
    next(error)
  }
}

export const deleteServiceController = async (req: Request<any>, res: Response, next: NextFunction) => {
  try {
    const service = await servicesServices.deleteService(req.params.service_id)
    if (service.deletedCount === 0) {
      return res.status(404).json({ message: SERVICES_MESSAGES.SERVICE_NOT_FOUND })
    }
    return res.json({ message: SERVICES_MESSAGES.DELETE_SERVICE_SUCCESS })
  } catch (error) {
    next(error)
  }
}