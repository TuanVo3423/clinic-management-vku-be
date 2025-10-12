import { Router } from 'express'
import {
  createServiceController,
  deleteServiceController,
  getServiceController,
  getServicesController,
  updateServiceController
} from '~/controllers/services.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const servicesRouter = Router()

// Tạo dịch vụ mới
servicesRouter.post('/', wrapRequestHandler(createServiceController))

// Lấy danh sách tất cả dịch vụ (có thể filter theo giá)
servicesRouter.get('/', wrapRequestHandler(getServicesController))

// Lấy dịch vụ theo ID
servicesRouter.get('/:service_id', wrapRequestHandler(getServiceController))

// Cập nhật thông tin dịch vụ
servicesRouter.patch('/:service_id', wrapRequestHandler(updateServiceController))

// Xóa dịch vụ
servicesRouter.delete('/:service_id', wrapRequestHandler(deleteServiceController))

export default servicesRouter