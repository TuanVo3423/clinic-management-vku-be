import { ethers } from 'ethers'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// ABI của AppointmentRegistry contract
const CONTRACT_ABI = [
  'function storeAppointmentHash(string memory appointmentId, bytes32 dataHash) public',
  'function updateAppointmentHash(string memory appointmentId, bytes32 newDataHash) public',
  'function verifyAppointmentHash(string memory appointmentId, bytes32 dataHash) public view returns (bool)',
  'function getAppointmentRecord(string memory appointmentId) public view returns (string memory, bytes32, uint256, address)',
  'function getAppointmentHistory(string memory appointmentId) public view returns (bytes32[] memory)',
  'function appointmentExists(string memory appointmentId) public view returns (bool)',
  'event AppointmentStored(string indexed appointmentId, bytes32 dataHash, uint256 timestamp, address submittedBy)',
  'event AppointmentUpdated(string indexed appointmentId, bytes32 oldHash, bytes32 newHash, uint256 timestamp, address submittedBy)'
]

class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null
  private wallet: ethers.Wallet | null = null
  private contract: ethers.Contract | null = null
  private contractAddress: string = ''

  constructor() {
    this.initialize()
  }

  /**
   * Khởi tạo kết nối với blockchain
   */
  private initialize() {
    try {
      // Lấy config từ environment variables
      const rpcUrl = process.env.SEPOLIA_RPC_URL || 'http://127.0.0.1:8545' // Ganache default
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || ''
      this.contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS || ''

      if (!privateKey) {
        console.warn('⚠️ BLOCKCHAIN_PRIVATE_KEY not found in .env. Blockchain service disabled.')
        return
      }

      // Kết nối với blockchain network
      this.provider = new ethers.JsonRpcProvider(rpcUrl)

      // Tạo wallet từ private key
      this.wallet = new ethers.Wallet(privateKey, this.provider)

      // Kết nối với smart contract (nếu đã deploy)
      if (this.contractAddress) {
        this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.wallet)
        console.log('✅ Connected to AppointmentRegistry contract at:', this.contractAddress)
      } else {
        console.warn('⚠️ BLOCKCHAIN_CONTRACT_ADDRESS not found. Please deploy contract first.')
      }
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error)
    }
  }

  /**
   * Tạo SHA256 hash từ appointment data
   */
  private createDataHash(appointmentData: any): string {
    // Chuyển object thành JSON string (sorted keys để đảm bảo consistent)
    const sortedData = JSON.stringify(appointmentData, Object.keys(appointmentData).sort())

    // Tạo SHA256 hash
    const hash = crypto.createHash('sha256').update(sortedData).digest('hex')

    return '0x' + hash
  }

  /**
   * Kiểm tra blockchain service có sẵn sàng không
   */
  public isReady(): boolean {
    return this.contract !== null && this.wallet !== null
  }

  /**
   * Lưu hash của appointment lên blockchain (lần đầu)
   * @param appointmentId MongoDB _id
   * @param appointmentData Dữ liệu appointment
   * @returns Transaction hash hoặc null nếu thất bại
   */
  public async storeAppointmentHash(appointmentId: string, appointmentData: any): Promise<string | null> {
    try {
      if (!this.isReady()) {
        console.warn('⚠️ Blockchain service not ready. Skipping hash storage.')
        return null
      }

      // Tạo hash từ appointment data
      const dataHash = this.createDataHash(appointmentData)

      console.log(`📝 Storing appointment ${appointmentId} to blockchain...`)
      console.log(`   Data hash: ${dataHash}`)

      // Gọi smart contract để lưu hash
      const tx = await this.contract!.storeAppointmentHash(appointmentId, dataHash)

      // Đợi transaction được confirm
      const receipt = await tx.wait()

      console.log(`✅ Appointment stored on blockchain. Tx hash: ${receipt.hash}`)

      return receipt.hash
    } catch (error: any) {
      console.error('❌ Failed to store appointment hash on blockchain:', error.message)
      return null
    }
  }

  /**
   * Cập nhật hash khi appointment thay đổi
   * @param appointmentId MongoDB _id
   * @param appointmentData Dữ liệu appointment mới
   * @returns Transaction hash hoặc null nếu thất bại
   */
  public async updateAppointmentHash(appointmentId: string, appointmentData: any): Promise<string | null> {
    try {
      if (!this.isReady()) {
        console.warn('⚠️ Blockchain service not ready. Skipping hash update.')
        return null
      }
      console.log("data luc update ne", appointmentData)
      // Tạo hash mới
      const newDataHash = this.createDataHash(appointmentData)

      console.log(`🔄 Updating appointment ${appointmentId} on blockchain...`)
      console.log(`   New data hash: ${newDataHash}`)

      // Gọi smart contract để update hash
      const tx = await this.contract!.updateAppointmentHash(appointmentId, newDataHash)

      // Đợi transaction được confirm
      const receipt = await tx.wait()

      console.log(`✅ Appointment updated on blockchain. Tx hash: ${receipt.hash}`)

      return receipt.hash
    } catch (error: any) {
      console.error('❌ Failed to update appointment hash on blockchain:', error.message)
      return null
    }
  }

  /**
   * Verify tính toàn vẹn của appointment
   * @param appointmentId MongoDB _id
   * @param appointmentData Dữ liệu appointment hiện tại
   * @returns Object chứa kết quả verify
   */
  public async verifyAppointmentIntegrity(
    appointmentId: string,
    appointmentData: any
  ): Promise<{
    isValid: boolean
    currentHash: string
    blockchainHash: string | null
    message: string
  }> {
    try {
      if (!this.isReady()) {
        return {
          isValid: false,
          currentHash: '',
          blockchainHash: null,
          message: 'Blockchain service not available'
        }
      }

      // Tạo hash từ current data
      const currentHash = this.createDataHash(appointmentData)

      // Lấy record từ blockchain
      const exists = await this.contract!.appointmentExists(appointmentId)

      if (!exists) {
        return {
          isValid: false,
          currentHash,
          blockchainHash: null,
          message: 'Appointment not found on blockchain'
        }
      }

      // Lấy hash từ blockchain
      const [_, blockchainHash] = await this.contract!.getAppointmentRecord(appointmentId)

      // So sánh hash
      const isValid = currentHash === blockchainHash

      return {
        isValid,
        currentHash,
        blockchainHash,
        message: isValid ? 'Data integrity verified successfully' : 'Data has been tampered with!'
      }
    } catch (error: any) {
      console.error('❌ Failed to verify appointment integrity:', error.message)
      return {
        isValid: false,
        currentHash: '',
        blockchainHash: null,
        message: `Verification failed: ${error.message}`
      }
    }
  }

  /**
   * Lấy lịch sử thay đổi của appointment từ blockchain
   * @param appointmentId MongoDB _id
   * @returns Array of hashes
   */
  public async getAppointmentHistory(appointmentId: string): Promise<string[]> {
    try {
      if (!this.isReady()) {
        console.warn('⚠️ Blockchain service not ready.')
        return []
      }

      const exists = await this.contract!.appointmentExists(appointmentId)
      if (!exists) {
        return []
      }

      const history = await this.contract!.getAppointmentHistory(appointmentId)
      return history
    } catch (error: any) {
      console.error('❌ Failed to get appointment history:', error.message)
      return []
    }
  }

  /**
   * Deploy smart contract (chỉ dùng 1 lần khi setup)
   */
  public async deployContract(): Promise<string | null> {
    try {
      if (!this.wallet) {
        console.error('❌ Wallet not initialized')
        return null
      }

      console.log('📦 Deploying AppointmentRegistry contract...')

      // Đọc bytecode từ compiled contract
      const contractPath = path.join(__dirname, '../../blockchain/contracts/AppointmentRegistry.sol')

      // Note: Cần compile contract trước bằng solc hoặc hardhat
      // Đây chỉ là placeholder, bạn cần thêm logic compile
      console.log('⚠️ Please compile contract first using Hardhat or Truffle')
      console.log('   Then update contract address in .env file')

      return null
    } catch (error: any) {
      console.error('❌ Failed to deploy contract:', error.message)
      return null
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService()
