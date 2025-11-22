# Blockchain Smart Contracts

This folder contains the smart contracts for the clinic management system's blockchain integration.

## Contract Overview

### AppointmentRegistry.sol

A Solidity smart contract that stores cryptographic hashes of appointment records to ensure data integrity and prevent tampering.

**Key Features:**
- Store appointment data hashes on blockchain
- Update hashes when appointments change
- Verify data integrity by comparing hashes
- Track complete history of changes
- Immutable audit trail

**Main Functions:**
- `storeAppointmentHash()`: Store initial hash
- `updateAppointmentHash()`: Update hash on changes
- `verifyAppointmentHash()`: Verify data integrity
- `getAppointmentRecord()`: Retrieve stored information
- `getAppointmentHistory()`: Get change history

## Quick Start

### 1. Install Dependencies

```bash
cd ..
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers
```

### 2. Copy Contract

Contract is already in `contracts/AppointmentRegistry.sol`

### 3. Start Local Blockchain

```bash
# Terminal 1 - Start Hardhat node
npx hardhat node
```

### 4. Deploy Contract

```bash
# Terminal 2 - Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

### 5. Configure Backend

Add the contract address to your `.env`:

```env
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_PRIVATE_KEY=<from-hardhat-node>
BLOCKCHAIN_CONTRACT_ADDRESS=<deployed-address>
```

## Compile Contract

```bash
npx hardhat compile
```

## Run Tests

```bash
npx hardhat test
```

## Deploy to Testnet

```bash
# Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Mumbai (Polygon)
npx hardhat run scripts/deploy.ts --network mumbai
```

## Verify Contract on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Gas Usage Estimation

- `storeAppointmentHash()`: ~60,000-80,000 gas
- `updateAppointmentHash()`: ~40,000-60,000 gas
- `verifyAppointmentHash()`: ~3,000 gas (read-only, free)
- `getAppointmentRecord()`: ~2,000 gas (read-only, free)

## Security Considerations

1. **Private Key Management**: Never commit private keys to Git
2. **Access Control**: Consider adding role-based access in future
3. **Gas Optimization**: Hash only critical fields
4. **Upgrade Path**: Consider proxy pattern for upgradability

## Network Options

### Local Development
- **Network**: Hardhat/Ganache
- **Cost**: FREE
- **Speed**: Instant
- **Use Case**: Development, testing

### Testnet (Recommended)
- **Network**: Sepolia or Mumbai
- **Cost**: FREE (test tokens)
- **Speed**: 12-15 seconds
- **Use Case**: Testing before production

### Mainnet (Production)
- **Network**: Ethereum or Polygon
- **Cost**: Real ETH/MATIC
- **Speed**: 12-15 seconds (Ethereum), 2 seconds (Polygon)
- **Use Case**: Production deployment

## Architecture

```
┌─────────────────────────────────────────────┐
│         Smart Contract (Blockchain)         │
├─────────────────────────────────────────────┤
│                                             │
│  mapping(appointmentId => Record)           │
│  ├─ appointmentId                           │
│  ├─ dataHash (SHA256)                       │
│  ├─ timestamp                               │
│  ├─ submittedBy (address)                   │
│  └─ exists (bool)                           │
│                                             │
│  mapping(appointmentId => hash[])           │
│  └─ History of all changes                  │
│                                             │
└─────────────────────────────────────────────┘
```

## Troubleshooting

### Error: Cannot find module 'hardhat'

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### Error: Private key invalid

Check your `.env` file and ensure `BLOCKCHAIN_PRIVATE_KEY` is valid.

### Error: Insufficient funds

Ensure your wallet has test ETH/MATIC for the network you're deploying to.

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## License

MIT
