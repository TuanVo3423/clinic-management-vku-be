import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import { CreateServiceBody, UpdateServiceBody } from '~/models/requests/services.request'
import Service from '~/models/schemas/Service.schema'

class ServicesServices {
  async createService(payload: CreateServiceBody) {
    const service = await databaseServices.services.insertOne(
      new Service(payload)
    )
    return service
  }

  async getServices() {
    const services = await databaseServices.services.find({}).toArray()
    return services
  }

  async getService(_id: string) {
    const service = await databaseServices.services.findOne({ _id: new ObjectId(_id) })
    return service
  }

  async updateService(_id: string, payload: UpdateServiceBody) {
    const service = await databaseServices.services.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: payload
      }
    )
    return service
  }

  async deleteService(_id: string) {
    const service = await databaseServices.services.deleteOne({ _id: new ObjectId(_id) })
    return service
  }

  async getServicesByPriceRange(minPrice: number, maxPrice: number) {
    const services = await databaseServices.services.find({
      price: { $gte: minPrice, $lte: maxPrice }
    }).toArray()
    return services
  }
}

const servicesServices = new ServicesServices()
export default servicesServices