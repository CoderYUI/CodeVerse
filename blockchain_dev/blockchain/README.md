# Blockchain Integration for SAARTHI

This document explains how to set up and use the blockchain integration for SAARTHI.

## Quick Start (Automated)

For those who want to automate the entire process, we've created a single script that handles everything:

```
node blockchain/automate.js
```

This script will:
1. Check if a contract is already deployed
2. If not, deploy a new contract automatically
3. Store all complaints on the blockchain
4. Verify and provide a summary of the results

## Manual Setup Steps

### 1. Deploy the Smart Contract

The first step is to deploy the MongoDataStorage smart contract to your blockchain (Ganache).

1. Make sure your Ganache blockchain is running
2. Compile the contract:
   ```
   truffle compile
   ```
3. Deploy the contract:
   ```
   truffle migrate
   ```
4. Note the contract address from the migration output

### 2. Record the Contract in the Database

After deployment, you need to record the contract in your database:

```
node blockchain/storeMongoData.js --record-contract YOUR_TRANSACTION_HASH YOUR_CONTRACT_ADDRESS
```

For example, with the details from your recent deployment:
```
node blockchain/storeMongoData.js --record-contract 0x708a0bfcb4cad1d74a2174da310fffa8a1e2da4dd39e2f9bcf0c82ee613374d1 0xAae8800AA1e8BD731bc82C385DFcc5f01ECae7EC
```

### 3. Store Complaint Data on the Blockchain

Now you can store your complaint data:

```
node blockchain/storeMongoData.js
```

### 4. View and Verify Data on the Blockchain

There are several ways to view your blockchain data:

#### View All Complaints

To verify all your stored complaints:

```
node blockchain/verifyBlockchainData.js
```

#### List All Complaints with Details

To see a detailed list of all complaints:

```
node blockchain/verifyBlockchainData.js --list
```

#### View Detailed Information About a Specific Complaint

To check a specific complaint with full details:

```
node blockchain/verifyBlockchainData.js --complaint YOUR_COMPLAINT_ID
```

For example:
```
node blockchain/verifyBlockchainData.js --complaint 6870d9915faa06feb627c12b
```

#### View Deployed Contracts

To list all deployed contracts:

```
node blockchain/verifyBlockchainData.js --contracts
```

## Data Viewing Examples

### Example: View a Specific Complaint

```
PS C:\Users\bhask\SAARTHI> node blockchain/verifyBlockchainData.js --complaint 6870d9915faa06feb627c12b

📋 Complaint Blockchain Details
============================
📝 Complaint ID: 6870d9915faa06feb627c12b
📅 Stored on: 12/7/2025, 12:07:12 am
📜 Blockchain Status: confirmed
🔐 Hash: 0x8e6bf12331170c8a8d1f9083c1f10e59870066cbc46eb30d8175cb6246d3539f
🔗 Contract Address: 0xAae8800AA1e8BD731bc82C385DFcc5f01ECae7EC
📌 Transaction Hash: 0xa6e81a3bbb699b737d7864c47cad08309e8ec3f30bee0e85cdce0c7f54ffed48
👤 Wallet Used: 0xbE3ccE0acd8F19A80038AddC67C29942B53fF710
✅ Verified on Blockchain: Yes

📄 Complaint Content
==================
📝 Text: my mom trying to kill my father and I am his son and after she got got failed she trying to run away as soon as possible with all the money but it's my request please taken her into a jail and I have all the evidences for her  that
👤 Complainant: Rakesh
📞 Phone: +919424426505
📅 Filed on: 2025-07-11T09:29:53.752381+00:00

// ...more details...
```

### Example: List All Complaints

```
PS C:\Users\bhask\SAARTHI> node blockchain/verifyBlockchainData.js --list

📋 Found 1 complaints stored on the blockchain
=================================================
+-------------------------+------------+------------------------+---------------+----------------------------------+
|Complaint ID             |Complainant |Filed On                |Location       |IPC Sections                      |
+-------------------------+------------+------------------------+---------------+----------------------------------+
|6870d9915faa06feb627c12b |Rakesh      |11/7/2025, 3:29:53 pm   |Arera Colony   |IPC 307, IPC 392, IPC 403, IPC 511|
+-------------------------+------------+------------------------+---------------+----------------------------------+

📌 To view detailed data for a specific complaint:
  node blockchain/verifyBlockchainData.js --complaint COMPLAINT_ID

📋 All Complaint IDs:
  6870d9915faa06feb627c12b
```

## Troubleshooting

### Error: No deployed contract found

If you see this error:
```
⚠️ No deployed contract found in database. Please deploy a contract first.
```

Run the `--record-contract` command as shown above in step 2.

### Error: Method not found

If you see an error about a missing method, make sure your smart contract contains all required functions:
- storeHash
- verifyHash
- getHashCount
- getHash
- checkHashExists

### Error: Transaction failed

If your transactions are failing:
1. Make sure your wallet has enough ETH
2. Check that the wallet address in .env is correct
3. Ensure Ganache is running
