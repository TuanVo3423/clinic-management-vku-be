import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

config()

const beds = [
  { bedNumber: 1, bedName: 'Bed 1 - General Ward', isAvailable: true, department: 'General', description: 'Standard bed in general ward', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 2, bedName: 'Bed 2 - General Ward', isAvailable: true, department: 'General', description: 'Standard bed in general ward', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 3, bedName: 'Bed 3 - ICU', isAvailable: true, department: 'ICU', description: 'Intensive Care Unit bed', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 4, bedName: 'Bed 4 - ICU', isAvailable: true, department: 'ICU', description: 'Intensive Care Unit bed', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 5, bedName: 'Bed 5 - Emergency', isAvailable: true, department: 'Emergency', description: 'Emergency department bed', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 6, bedName: 'Bed 6 - Emergency', isAvailable: true, department: 'Emergency', description: 'Emergency department bed', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 7, bedName: 'Bed 7 - Surgery', isAvailable: true, department: 'Surgery', description: 'Post-surgery recovery bed', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 8, bedName: 'Bed 8 - Surgery', isAvailable: true, department: 'Surgery', description: 'Post-surgery recovery bed', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 9, bedName: 'Bed 9 - Pediatrics', isAvailable: true, department: 'Pediatrics', description: 'Pediatric ward bed', createdAt: new Date(), updatedAt: new Date() },
  { bedNumber: 10, bedName: 'Bed 10 - Pediatrics', isAvailable: true, department: 'Pediatrics', description: 'Pediatric ward bed', createdAt: new Date(), updatedAt: new Date() }
]

async function seedBeds() {
  const client = new MongoClient(process.env.DB_URL as string)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(process.env.DB_NAME)
    const bedsCollection = db.collection(process.env.DB_BEDS_COLLECTION as string)
    
    // Check if beds already exist
    const existingBedsCount = await bedsCollection.countDocuments()
    
    if (existingBedsCount > 0) {
      console.log(`${existingBedsCount} beds already exist in the database`)
      const response = await promptUser('Do you want to delete existing beds and reseed? (yes/no): ')
      
      if (response.toLowerCase() === 'yes' || response.toLowerCase() === 'y') {
        await bedsCollection.deleteMany({})
        console.log('Existing beds deleted')
      } else {
        console.log('Seeding cancelled')
        return
      }
    }
    
    // Insert beds
    const result = await bedsCollection.insertMany(beds)
    console.log(`✅ Successfully created ${result.insertedCount} beds`)
    
    // Display created beds
    const createdBeds = await bedsCollection.find().sort({ bedNumber: 1 }).toArray()
    console.log('\nCreated beds:')
    createdBeds.forEach(bed => {
      console.log(`  - Bed ${bed.bedNumber}: ${bed.bedName} (${bed.department})`)
    })
    
  } catch (error) {
    console.error('Error seeding beds:', error)
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
seedBeds().catch(console.error)
