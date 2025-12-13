import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

config()

const collections = [
  { key: 'patients', env: 'DB_PATIENTS_COLLECTION' },
  { key: 'doctors', env: 'DB_DOCTORS_COLLECTION' },
  { key: 'services', env: 'DB_SERVICES_COLLECTION' },
  { key: 'appointments', env: 'DB_APPOINTMENTS_COLLECTION' },
  { key: 'notifications', env: 'DB_NOTIFICATIONS_COLLECTION' },
  { key: 'beds', env: 'DB_BEDS_COLLECTION' },
  { key: 'otps', env: 'DB_OTPS_COLLECTION' }
]

async function cleanDatabase() {
  const client = new MongoClient(process.env.DB_URL as string)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(process.env.DB_NAME)

    console.log('\n🧹 Các collection sẽ bị xóa dữ liệu:')
    collections.forEach(c => {
      console.log(`  - ${process.env[c.env]}`)
    })

    const answer = await promptUser('\n⚠️ Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu? (yes/no): ')
    if (!['yes', 'y'].includes(answer.toLowerCase())) {
      console.log('❌ Hủy thao tác clean database')
      return
    }

    console.log('\n🚀 Bắt đầu clean database...\n')

    for (const col of collections) {
      const collectionName = process.env[col.env] as string
      const collection = db.collection(collectionName)

      const countBefore = await collection.countDocuments()
      if (countBefore === 0) {
        console.log(`ℹ️  ${collectionName}: không có dữ liệu`)
        continue
      }

      const result = await collection.deleteMany({})
      console.log(`🗑️  ${collectionName}: đã xóa ${result.deletedCount} bản ghi`)
    }

    console.log('\n✨ Clean database thành công!')
  } catch (error) {
    console.error('❌ Lỗi khi clean database:', error)
  } finally {
    await client.close()
    console.log('\n🔌 Đã đóng kết nối database')
  }
}

/**
 * Prompt hỏi user
 */
function promptUser(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    readline.question(question, (answer: string) => {
      readline.close()
      resolve(answer)
    })
  })
}

// Run script
cleanDatabase().catch(console.error)
