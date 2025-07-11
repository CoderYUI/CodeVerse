require('dotenv').config();
const mongoose = require('mongoose');
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🚀 Starting SAARTHI Blockchain Automation");
console.log("========================================");

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Web3 Setup
const web3 = new Web3(process.env.RPC_URL || "http://127.0.0.1:7545");
const contractPath = path.resolve(__dirname, '..', 'build', 'contracts', 'MongoDataStorage.json');
let contractJSON;

try {
  contractJSON = JSON.parse(fs.readFileSync(contractPath));
} catch (err) {
  console.error("❌ Error reading contract JSON. Make sure you've compiled the contract:");
  console.error("   Run: truffle compile");
  process.exit(1);
}

const contractABI = contractJSON.abi;

// Get the wallet address from environment
const configuredWalletAddress = process.env.WALLET_ADDRESS;

// ✅ Import schemas from original script
const dataSchema = new mongoose.Schema({
  complaintId: String,
  hash: String,
  timestamp: Date,
  transactionHash: String,
  contractAddress: String,
  complaintData: Object,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  errorMessage: String,
  walletUsed: String
});

const BlockchainData = mongoose.model('BlockchainData', dataSchema);

const contractSchema = new mongoose.Schema({
  address: {
    type: String,
    unique: true
  },
  deployedAt: Date,
  deployedBy: String,
  transactionHash: String,
  isActive: {
    type: Boolean,
    default: true
  }
});

const DeployedContract = mongoose.model('DeployedContract', contractSchema);

const complaintSchema = new mongoose.Schema({
  text: String,
  language: String,
  status: String,
  complainantId: String,
  complainantName: String,
  complainantPhone: String,
  filedAt: String,
  filedBy: {
    id: String,
    name: String,
    role: String
  },
  incidentDetails: {
    date: String,
    location: String,
    category: String
  },
  legalClassification: {
    ipc_sections: [String]
  },
  analysisResult: {
    isCognizable: Boolean,
    sections: [{
      section: String,
      description: String
    }],
    summary: String,
    explanation: String
  },
  suggestedSections: [String],
  summary: String,
  explanation: String
}, { collection: 'complaints' });

const Complaint = mongoose.model('Complaint', complaintSchema);

// Function to create a simple table format
function createTable(headers, rows) {
  const colWidths = headers.map((header, index) => {
    const maxContentLength = rows.reduce((max, row) => {
      const cellLength = String(row[index] || '').length;
      return Math.max(max, cellLength);
    }, 0);
    return Math.max(String(header).length, maxContentLength) + 2;
  });

  const separator = '+' + colWidths.map(width => '-'.repeat(width)).join('+') + '+';
  const headerRow = '|' + headers.map((header, index) => {
    return header.padEnd(colWidths[index]);
  }).join('|') + '|';

  let tableOutput = `${separator}\n${headerRow}\n${separator}\n`;

  rows.forEach(row => {
    const formattedRow = '|' + row.map((cell, index) => {
      return String(cell || '').padEnd(colWidths[index]);
    }).join('|') + '|';
    tableOutput += `${formattedRow}\n`;
  });

  tableOutput += separator;
  return tableOutput;
}

// ✅ Check if we have an active contract
async function checkOrDeployContract() {
  console.log("\n📋 Step 1: Checking for deployed contracts");
  console.log("----------------------------------------");
  
  // Check if we already have a contract
  const activeContract = await DeployedContract.findOne({ isActive: true }).sort({ deployedAt: -1 });
  
  if (activeContract) {
    console.log(`✅ Found active contract: ${activeContract.address}`);
    console.log(`📅 Deployed on: ${new Date(activeContract.deployedAt).toLocaleString()}`);
    return activeContract.address;
  }
  
  console.log("⚠️ No active contract found. Deploying a new one...");
  
  // Check if truffle and ganache are installed
  try {
    execSync('truffle --version', { stdio: 'ignore' });
  } catch (err) {
    console.error("❌ Truffle not found. Please install it with: npm install -g truffle");
    process.exit(1);
  }
  
  // Check if contract is compiled
  if (!fs.existsSync(contractPath)) {
    console.log("⚠️ Contract not compiled. Compiling now...");
    try {
      execSync('truffle compile', { stdio: 'inherit' });
    } catch (err) {
      console.error("❌ Error compiling contract:", err.message);
      process.exit(1);
    }
  }
  
  // Deploy the contract
  console.log("🔧 Deploying new contract...");
  
  // First try the standard way
  try {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = configuredWalletAddress || accounts[0];
    
    // Create contract instance without an address (for deployment)
    const MongoDataStorage = new web3.eth.Contract(contractABI);
    
    // Deploy the contract
    const deployed = await MongoDataStorage.deploy({
      data: contractJSON.bytecode,
      arguments: []
    }).send({
      from: fromAddress,
      gas: 3000000
    });
    
    const contractAddress = deployed.options.address;
    const txHash = deployed._transactionHash;
    
    console.log(`✅ Contract deployed at address: ${contractAddress}`);
    console.log(`🔗 Transaction hash: ${txHash}`);
    
    // Record the deployment in our database
    await DeployedContract.create({
      address: contractAddress,
      deployedAt: new Date(),
      deployedBy: fromAddress,
      transactionHash: txHash,
      isActive: true
    });
    
    console.log(`✅ Contract deployment recorded in database.`);
    return contractAddress;
    
  } catch (err) {
    console.error(`⚠️ Error deploying directly: ${err.message}`);
    console.log("🔄 Trying migration approach instead...");
    
    try {
      // Use truffle migrate as a fallback
      const output = execSync('truffle migrate', { encoding: 'utf8' });
      
      // Try to extract contract address from migration output
      const addressMatch = output.match(/contract address:\s+([0-9a-fA-Fx]+)/);
      const txHashMatch = output.match(/transaction hash:\s+([0-9a-fA-Fx]+)/);
      
      if (addressMatch && addressMatch[1] && txHashMatch && txHashMatch[1]) {
        const contractAddress = addressMatch[1];
        const txHash = txHashMatch[1];
        
        console.log(`✅ Contract deployed at address: ${contractAddress}`);
        console.log(`🔗 Transaction hash: ${txHash}`);
        
        // Get wallet from env or use first account
        const accounts = await web3.eth.getAccounts();
        const fromAddress = configuredWalletAddress || accounts[0];
        
        // Record the deployment in our database
        await DeployedContract.create({
          address: contractAddress,
          deployedAt: new Date(),
          deployedBy: fromAddress,
          transactionHash: txHash,
          isActive: true
        });
        
        console.log(`✅ Contract deployment recorded in database.`);
        return contractAddress;
      } else {
        throw new Error("Could not extract contract address from migration output");
      }
    } catch (migrateErr) {
      console.error(`❌ Error deploying via migration: ${migrateErr.message}`);
      console.error("❌ Please deploy the contract manually:");
      console.error("   1. Run: truffle migrate");
      console.error("   2. Run: node blockchain/storeMongoData.js --record-contract YOUR_TX_HASH YOUR_CONTRACT_ADDRESS");
      process.exit(1);
    }
  }
}

// ✅ Function to store complaints on blockchain
async function storeComplaints(contractAddress) {
  console.log("\n📋 Step 2: Storing complaints on blockchain");
  console.log("----------------------------------------");
  
  // Get all complaints
  const complaints = await Complaint.find();
  console.log(`🔍 Found ${complaints.length} complaints to process.`);
  
  if (complaints.length === 0) {
    console.log("⚠️ No complaints found in the database. Nothing to store.");
    return [];
  }
  
  // Get accounts
  const accounts = await web3.eth.getAccounts();
  
  // Setup wallet address for transactions
  let fromAddress;
  if (configuredWalletAddress && web3.utils.isAddress(configuredWalletAddress)) {
    const isAvailable = accounts.some(
      account => account.toLowerCase() === configuredWalletAddress.toLowerCase()
    );
    
    if (isAvailable) {
      fromAddress = configuredWalletAddress;
      console.log(`✅ Using wallet address for transactions: ${fromAddress}`);
    } else {
      console.warn(`⚠️ Configured wallet address ${configuredWalletAddress} not found in Ganache accounts`);
      fromAddress = accounts[0];
      console.log(`✅ Falling back to first Ganache account: ${fromAddress}`);
    }
  } else {
    fromAddress = accounts[0];
    console.log(`✅ Using first Ganache account: ${fromAddress}`);
  }
  
  // Check balance
  const balance = await web3.eth.getBalance(fromAddress);
  console.log(`💰 Wallet balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);
  
  // Check for zero balance
  if (balance === '0' || balance === 0) {
    console.error(`❌ Wallet has zero balance. Cannot proceed with transactions.`);
    return [];
  }
  
  // Initialize contract
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  
  // Process each complaint
  const results = [];
  
  for (const complaint of complaints) {
    try {
      // Check if already processed
      const existingRecord = await BlockchainData.findOne({ 
        complaintId: complaint._id.toString(),
        status: 'confirmed'
      });
      
      if (existingRecord) {
        console.log(`⏭️ Complaint ${complaint._id} already processed. Skipping.`);
        results.push({
          id: complaint._id.toString(),
          status: 'already-processed',
          hash: existingRecord.hash,
          txHash: existingRecord.transactionHash
        });
        continue;
      }
      
      // Generate hash of the complaint
      const hash = hashComplaint(complaint);
      console.log(`⏳ Processing complaint: ${complaint._id}`);
      
      // Create a record in the database
      const record = await BlockchainData.create({
        complaintId: complaint._id.toString(),
        hash: hash,
        timestamp: new Date(),
        status: 'pending',
        contractAddress: contractAddress,
        complaintData: complaint.toObject(),
        walletUsed: fromAddress
      });
      
      // Store the hash on the blockchain
      console.log(`🔗 Sending transaction to blockchain...`);
      
      const tx = await contract.methods.storeHash(hash).send({
        from: fromAddress,
        gas: 300000,
      });
      
      console.log(`✅ Transaction successful: ${tx.transactionHash}`);
      
      // Update the record
      await BlockchainData.updateOne(
        { _id: record._id },
        { 
          $set: { 
            transactionHash: tx.transactionHash,
            status: 'confirmed'
          } 
        }
      );
      
      results.push({
        id: complaint._id.toString(),
        status: 'success',
        hash: hash,
        txHash: tx.transactionHash
      });
      
      console.log(`✅ Complaint ${complaint._id} stored on blockchain`);
      
    } catch (err) {
      console.error(`❌ Error processing complaint ${complaint._id}:`, err.message);
      
      results.push({
        id: complaint._id.toString(),
        status: 'failed',
        error: err.message
      });
      
      // Update any pending record with failed status
      await BlockchainData.updateOne(
        { complaintId: complaint._id.toString(), status: 'pending' },
        { 
          $set: { 
            status: 'failed',
            errorMessage: err.message
          } 
        }
      );
    }
  }
  
  return results;
}

// ✅ Function to verify stored hashes
async function verifyHashes(contractAddress) {
  console.log("\n📋 Step 3: Verifying stored hashes");
  console.log("--------------------------------");
  
  // Get all confirmed records
  const confirmedRecords = await BlockchainData.find({ status: 'confirmed' });
  
  if (confirmedRecords.length === 0) {
    console.log("⚠️ No confirmed records found to verify.");
    return [];
  }
  
  console.log(`🔍 Verifying ${confirmedRecords.length} records...`);
  
  // Initialize contract
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  
  // Verify each record
  const results = [];
  
  for (const record of confirmedRecords) {
    try {
      // Create contract instance with the stored contract address
      const recordContract = new web3.eth.Contract(contractABI, record.contractAddress);
      
      // Verify the hash exists on the blockchain
      const exists = await recordContract.methods.verifyHash(record.hash).call();
      
      if (exists) {
        console.log(`✅ Verified: Hash for complaint ${record.complaintId}`);
        results.push({
          id: record.complaintId,
          status: 'verified',
          hash: record.hash
        });
      } else {
        console.log(`❌ Verification failed for complaint ${record.complaintId}`);
        results.push({
          id: record.complaintId,
          status: 'failed',
          hash: record.hash
        });
      }
    } catch (err) {
      console.error(`❌ Error verifying hash for complaint ${record.complaintId}:`, err.message);
      results.push({
        id: record.complaintId,
        status: 'error',
        hash: record.hash,
        error: err.message
      });
    }
  }
  
  return results;
}

// ✅ Function to hash complaint data (same as in storeMongoData.js)
function hashComplaint(complaint) {
  // Create a normalized representation of the complaint
  const complaintToHash = {
    id: complaint._id.toString(),
    text: complaint.text,
    complainantId: complaint.complainantId,
    complainantName: complaint.complainantName,
    filedAt: complaint.filedAt,
    filedBy: complaint.filedBy,
    incidentDetails: complaint.incidentDetails,
    legalSections: complaint.legalClassification?.ipc_sections || [],
    suggestedSections: complaint.suggestedSections || []
  };
  
  // Sort arrays and keys for consistent hashing
  const normalized = JSON.stringify(complaintToHash, (key, value) => {
    if (Array.isArray(value)) {
      return value.sort();
    }
    return value;
  });
  
  // Create a hash using Web3's keccak256 function
  return web3.utils.keccak256(normalized);
}

// ✅ Main function to run everything
async function main() {
  try {
    // Step 1: Check or deploy contract
    const contractAddress = await checkOrDeployContract();
    
    // Step 2: Store complaints
    const storeResults = await storeComplaints(contractAddress);
    
    // Step 3: Verify hashes
    const verifyResults = await verifyHashes(contractAddress);
    
    // Step 4: Display summary
    console.log("\n📊 Summary of Results");
    console.log("===================");
    
    console.log(`✅ Contract Address: ${contractAddress}`);
    console.log(`📝 Total Complaints Processed: ${storeResults.length}`);
    
    const successCount = storeResults.filter(r => r.status === 'success').length;
    const alreadyProcessedCount = storeResults.filter(r => r.status === 'already-processed').length;
    const failedCount = storeResults.filter(r => r.status === 'failed').length;
    
    console.log(`✅ Successfully Stored: ${successCount}`);
    console.log(`⏭️ Already Processed: ${alreadyProcessedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    
    const verifiedCount = verifyResults.filter(r => r.status === 'verified').length;
    const verifyFailedCount = verifyResults.filter(r => r.status !== 'verified').length;
    
    console.log(`\n🔍 Verification Results:`);
    console.log(`✅ Successfully Verified: ${verifiedCount}`);
    console.log(`❌ Verification Failed: ${verifyFailedCount}`);
    
    // Show table of processed complaints
    if (storeResults.length > 0) {
      console.log("\n📋 Complaint Processing Results:");
      
      const headers = ['Complaint ID', 'Status', 'Hash (First 10 chars)'];
      const rows = storeResults.map(result => [
        result.id,
        result.status === 'success' ? '✅ Success' : 
        result.status === 'already-processed' ? '⏭️ Already Processed' : '❌ Failed',
        result.hash ? result.hash.substring(0, 10) + '...' : 'N/A'
      ]);
      
      console.log(createTable(headers, rows));
    }
    
    // Show next steps
    console.log("\n📌 Next Steps:");
    console.log("1. To view detailed information about a specific complaint:");
    console.log(`   node blockchain/verifyBlockchainData.js --complaint COMPLAINT_ID`);
    console.log("2. To list all stored complaints with details:");
    console.log(`   node blockchain/verifyBlockchainData.js --list`);
    
  } catch (err) {
    console.error("❌ Error in main process:", err);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
    console.log("\n📌 MongoDB connection closed");
  }
}

// Run the main function
main();
