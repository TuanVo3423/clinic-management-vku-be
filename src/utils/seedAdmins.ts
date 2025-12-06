import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
import { hashPassword } from './crypto'

config()

const admins = [
  {
    name: 'Admin',
    email: 'tuanvv.21it@vku.udn.vn',
    specialization: 'Administrator',
    phone: '0123456789',
    password: hashPassword('password'),
    workingDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '17:00',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

async function seedAdmins() {
  const client = new MongoClient(process.env.DB_URL as string)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db(process.env.DB_NAME)
    const adminsCollection = db.collection(process.env.DB_DOCTORS_COLLECTION as string)

    // Check if admins already exist
    const existingAdminsCount = await adminsCollection.countDocuments()

    if (existingAdminsCount > 0) {
      console.log(`${existingAdminsCount} admins already exist in the database`)
      const response = await promptUser('Do you want to delete existing admins and reseed? (yes/no): ')

      if (response.toLowerCase() === 'yes' || response.toLowerCase() === 'y') {
        await adminsCollection.deleteMany({})
        console.log('Existing admins deleted')
      } else {
        console.log('Seeding cancelled')
        return
      }
    }

    // Insert admins
    const result = await adminsCollection.insertMany(admins)
    console.log(`✅ Successfully created ${result.insertedCount} admins`)

    // Display created admins
    const createdAdmins = await adminsCollection.find().toArray()
    console.log('\nCreated admins:')
    createdAdmins.forEach((admin) => {
      console.log(`  - Admin ${admin.name}: ${admin.email}`)
    })
  } catch (error) {
    console.error('Error seeding admins:', error)
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
seedAdmins().catch(console.error)
