import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

config()

const services = [
  {
    name: 'Khám bệnh, tư vấn kê đơn thuốc',
    description:
      'Bác sĩ trực tiếp thăm khám, chẩn đoán tình trạng bệnh, tư vấn phương pháp điều trị phù hợp và kê đơn thuốc nếu cần thiết.',
    duration: 30,
    price: 0
  },
  {
    name: 'Châm cứu đèn hồng ngoại',
    description:
      'Kết hợp châm cứu và chiếu đèn hồng ngoại giúp tăng cường lưu thông máu, giảm đau, thư giãn cơ và phục hồi tổn thương mô mềm.',
    duration: 45,
    price: 250000
  },
  {
    name: 'Siêu âm điều trị',
    description:
      'Sử dụng sóng siêu âm tần số cao để giảm viêm, giảm đau và hỗ trợ tái tạo mô tổn thương trong các bệnh lý cơ xương khớp.',
    duration: 30,
    price: 200000
  },
  {
    name: 'Điều trị bằng sóng xung kích',
    description:
      'Dùng sóng xung kích cường độ cao tác động trực tiếp lên vùng tổn thương để giảm đau mạn tính, kích thích tái tạo mô và cải thiện vận động.',
    duration: 40,
    price: 400000
  },
  {
    name: 'Điện xung',
    description:
      'Điều trị bằng dòng điện xung tần số thấp giúp giảm đau, tăng tuần hoàn máu và phục hồi chức năng thần kinh – cơ.',
    duration: 30,
    price: 200000
  },
  {
    name: 'Kéo giãn cột sống',
    description:
      'Sử dụng máy kéo giãn hiện đại giúp giảm chèn ép thần kinh, cải thiện thoát vị đĩa đệm và giảm đau cột sống hiệu quả.',
    duration: 45,
    price: 300000
  },
  {
    name: 'Xoa bóp bấm huyệt và tập',
    description:
      'Phối hợp xoa bóp, bấm huyệt và hướng dẫn tập phục hồi giúp thư giãn cơ, giảm đau nhức, tăng độ linh hoạt và cải thiện sức khỏe tổng thể.',
    duration: 60,
    price: 350000
  },
  {
    name: 'Hỏa long cứu',
    description:
      'Phương pháp trị liệu bằng nhiệt kết hợp châm cứu, sử dụng điếu ngải và cốc hỏa để tăng cường lưu thông khí huyết, giảm đau nhức và lạnh cơ thể.',
    duration: 40,
    price: 250000
  }
]

async function seedServices() {
  const client = new MongoClient(process.env.DB_URL as string)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db(process.env.DB_NAME)
    const servicesCollection = db.collection(process.env.DB_SERVICES_COLLECTION as string)

    // Check if beds already exist
    const existingServicesCount = await servicesCollection.countDocuments()

    if (existingServicesCount > 0) {
      console.log(`${existingServicesCount} services already exist in the database`)
      const response = await promptUser('Do you want to delete existing services and reseed? (yes/no): ')

      if (response.toLowerCase() === 'yes' || response.toLowerCase() === 'y') {
        await servicesCollection.deleteMany({})
        console.log('Existing services deleted')
      } else {
        console.log('Seeding cancelled')
        return
      }
    }

    // Insert services
    const result = await servicesCollection.insertMany(services)
    console.log(`✅ Successfully created ${result.insertedCount} services`)

    // Display created services
    const createdServices = await servicesCollection.find().sort({ serviceNumber: 1 }).toArray()
    console.log('\nCreated services:')
    createdServices.forEach((service) => {
      console.log(`  - Service ${service.serviceNumber}: ${service.serviceName} (${service.department})`)
    })
  } catch (error) {
    console.error('Error seeding services:', error)
  } finally {
    await client.close()
    console.log('\nDatabase connection closed')
  }
}

function promptUser(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close()
      resolve(answer)
    })
  })
}

// Run the seeding script
seedServices().catch(console.error)
