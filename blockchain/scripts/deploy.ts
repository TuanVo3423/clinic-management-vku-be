const hre = require('hardhat')
const { ethers } = hre

async function main() {
  console.log('🚀 Deploying AppointmentRegistry contract...\n')

  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log('📍 Deploying from account:', deployer.address)

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH\n')

  // Deploy contract
  const AppointmentRegistry = await ethers.getContractFactory('AppointmentRegistry')
  console.log('⏳ Deploying contract...')

  const contract = await AppointmentRegistry.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()

  console.log('\n✅ AppointmentRegistry deployed successfully!')
  console.log('📝 Contract address:', address)
  console.log('\n🔧 Add this to your .env file:')
  console.log('='.repeat(60))
  console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${address}`)
  console.log('='.repeat(60))

  // Verify contract is working
  console.log('\n🔍 Verifying contract...')
  const testId = 'test_appointment_123'
  const testHash = ethers.keccak256(ethers.toUtf8Bytes('test data'))

  console.log('⏳ Testing storeAppointmentHash...')
  const tx = await contract.storeAppointmentHash(testId, testHash)
  await tx.wait()
  console.log('✅ Test transaction successful!')

  const exists = await contract.appointmentExists(testId)
  console.log('✅ Appointment exists check:', exists)

  if (exists) {
    const [id, hash, timestamp, submitter] = await contract.getAppointmentRecord(testId)
    console.log('\n📋 Test Record Details:')
    console.log('   ID:', id)
    console.log('   Hash:', hash)
    console.log('   Timestamp:', new Date(Number(timestamp) * 1000).toISOString())
    console.log('   Submitter:', submitter)
  }

  console.log('\n✅ Contract deployment and verification complete!')
  console.log('\n🎉 You can now start using the blockchain integration!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })
