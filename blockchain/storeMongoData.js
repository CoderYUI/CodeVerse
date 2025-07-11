require('dotenv').config();
const mongoose = require('mongoose');
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

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
const contractJSON = JSON.parse(fs.readFileSync(contractPath));
const contractABI = contractJSON.abi;

// Get the wallet address from environment - this will be used for transaction signing
const configuredWalletAddress = process.env.WALLET_ADDRESS;

// ✅ Mongo Schemas
const dataSchema = new mongoose.Schema({
  complaintId: String,
  hash: String,
  timestamp: Date,
  transactionHash: String,
  contractAddress: String, // Store the dynamically created contract address
  complaintData: Object,  // Store the complete complaint data for reference
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  errorMessage: String,
  walletUsed: String // Store the wallet that was used for the transaction
});

const BlockchainData = mongoose.model('BlockchainData', dataSchema);

// Store deployed contract addresses for verification
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

// Complaint Schema (matching the database structure)
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

// ✅ Enhanced function to hash complaint data
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

// ✅ Function to get the most recent active contract address
async function getActiveContractAddress() {
  // First check if we have a recent contract deployment
  const latestContract = await DeployedContract.findOne({ isActive: true }).sort({ deployedAt: -1 });
  
  if (latestContract) {
    return latestContract.address;
  }
  
  console.log("⚠️ No deployed contract found in database. Please deploy a contract first.");
  return null;
}

// ✅ Process Complaints and Store Hashes on Blockchain
async function syncComplaintsToBlockchain() {
  try {
    // Get all complaints that need to be hashed and stored
    const complaints = await Complaint.find();
    const accounts = await web3.eth.getAccounts();
    
    // Setup wallet address for transactions - this is the sender account
    let fromAddress;
    if (configuredWalletAddress && web3.utils.isAddress(configuredWalletAddress)) {
      // Check if wallet address is in available accounts
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
      console.log(`✅ No wallet address configured. Using first Ganache account: ${fromAddress}`);
    }
    
    // Get the active contract address
    const contractAddress = await getActiveContractAddress();
    if (!contractAddress) {
      console.error("❌ Cannot proceed without a contract address.");
      mongoose.connection.close();
      return;
    }
    
    // Initialize contract with the fetched address
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    console.log(`🔗 Using contract at address: ${contractAddress}`);
    
    // Check balance to ensure the wallet can pay for transactions
    const balance = await web3.eth.getBalance(fromAddress);
    console.log(`💰 Wallet balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);
    
    // Fix for toBN error - use alternative method to check for zero balance
    if (balance === '0' || balance === 0) {
      console.error(`❌ Wallet has zero balance. Cannot proceed with transactions.`);
      mongoose.connection.close();
      return;
    }
    
    console.log(`🔍 Found ${complaints.length} complaints to process.`);
    
    for (const complaint of complaints) {
      try {
        // Check if this complaint is already hashed and stored
        const existingRecord = await BlockchainData.findOne({ 
          complaintId: complaint._id.toString(),
          status: 'confirmed'  // Only skip if successfully confirmed
        });
        
        if (existingRecord) {
          console.log(`⏭️ Complaint ${complaint._id} already processed and confirmed. Skipping.`);
          continue;
        }
        
        // Check for pending or failed transactions
        const pendingRecord = await BlockchainData.findOne({
          complaintId: complaint._id.toString(),
          status: { $in: ['pending', 'failed'] }
        });
        
        if (pendingRecord) {
          console.log(`🔄 Retrying complaint ${complaint._id} (previous status: ${pendingRecord.status})`);
          
          // Update the status to pending if it was failed
          if (pendingRecord.status === 'failed') {
            await BlockchainData.updateOne(
              { _id: pendingRecord._id },
              { $set: { status: 'pending', errorMessage: null } }
            );
          }
        } else {
          // Create a new record in pending state - store the contract address that will be used
          const hash = hashComplaint(complaint);
          
          console.log(`⏳ Processing new complaint ID: ${complaint._id}`);
          console.log(`📄 Hash: ${hash}`);
          
          await BlockchainData.create({
            complaintId: complaint._id.toString(),
            hash: hash,
            timestamp: new Date(),
            status: 'pending',
            contractAddress: contractAddress, // Store which contract we're using
            complaintData: complaint.toObject(),
            walletUsed: fromAddress
          });
        }
        
        // Get the record (either existing pending or newly created)
        const record = await BlockchainData.findOne({ 
          complaintId: complaint._id.toString(),
          status: 'pending'
        });
        
        if (!record) {
          console.log(`❌ Error: Could not find or create record for complaint ${complaint._id}`);
          continue;
        }
        
        // Store the hash on the blockchain
        console.log(`🔗 Sending transaction to blockchain for complaint: ${complaint._id}`);
        
        const tx = await contract.methods.storeHash(record.hash).send({
          from: fromAddress,
          gas: 300000,
        });
        
        console.log(`✅ Transaction successful: ${tx.transactionHash}`);
        console.log(`⛽ Gas used: ${tx.gasUsed}`);
        
        // Update the record with transaction hash and set status to confirmed
        await BlockchainData.updateOne(
          { _id: record._id },
          { 
            $set: { 
              transactionHash: tx.transactionHash,
              status: 'confirmed',
              walletUsed: fromAddress,
              contractAddress: contractAddress // Ensure contract address is stored
            } 
          }
        );
        
        console.log(`📝 Confirmed and recorded hash in database for complaint: ${complaint._id}`);
        
      } catch (err) {
        console.error(`❌ Error processing complaint ${complaint._id}:`, err.message);
        
        // Update the record with failed status and error message
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

    console.log("✅ Synchronization complete!");

  } catch (err) {
    console.error("❌ Error during sync:", err);
  } finally {
    mongoose.connection.close();
    console.log("📌 MongoDB connection closed");
  }
}

// ✅ Function to verify hashes on the blockchain
async function verifyComplaintHashes() {
  try {
    // Get all records that have been confirmed
    const confirmedRecords = await BlockchainData.find({ status: 'confirmed' });
    
    console.log(`🔍 Verifying ${confirmedRecords.length} confirmed records on the blockchain...`);
    
    for (const record of confirmedRecords) {
      try {
        // Create contract instance with the stored contract address
        const contract = new web3.eth.Contract(contractABI, record.contractAddress);
        
        // Verify the hash exists on the blockchain
        const exists = await contract.methods.verifyHash(record.hash).call();
        
        if (exists) {
          console.log(`✅ Verified: Hash ${record.hash} for complaint ${record.complaintId} exists on contract ${record.contractAddress}`);
        } else {
          console.log(`❌ Verification failed: Hash ${record.hash} for complaint ${record.complaintId} NOT found on contract ${record.contractAddress}!`);
          
          // Set status back to failed so it can be retried
          await BlockchainData.updateOne(
            { _id: record._id },
            { 
              $set: { 
                status: 'failed',
                errorMessage: 'Hash verification failed on blockchain'
              } 
            }
          );
        }
      } catch (err) {
        console.error(`❌ Error verifying hash for complaint ${record.complaintId}:`, err.message);
      }
    }
    
    console.log("✅ Verification complete!");
    
  } catch (err) {
    console.error("❌ Error during verification:", err);
  } finally {
    mongoose.connection.close();
    console.log("📌 MongoDB connection closed");
  }
}

// ✅ Function to record a new contract deployment
async function recordContractDeployment(address, txHash, deployedBy) {
  try {
    await DeployedContract.create({
      address: address,
      deployedAt: new Date(),
      deployedBy: deployedBy,
      transactionHash: txHash,
      isActive: true
    });
    
    console.log(`✅ Recorded new contract deployment at address: ${address}`);
    return true;
  } catch (err) {
    console.error(`❌ Error recording contract deployment: ${err.message}`);
    return false;
  }
}

// ✅ Function to deploy a new contract
async function deployNewContract() {
  try {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = configuredWalletAddress || accounts[0];
    
    console.log(`🔧 Deploying new contract from address: ${fromAddress}`);
    
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
    
    console.log(`✅ Contract deployed at address: ${deployed.options.address}`);
    console.log(`🔗 Transaction hash: ${deployed._transactionHash}`);
    
    // Record the deployment in our database
    await recordContractDeployment(
      deployed.options.address, 
      deployed._transactionHash,
      fromAddress
    );
    
    console.log(`✅ Contract deployment recorded in database.`);
    return deployed.options.address;
    
  } catch (err) {
    console.error(`❌ Error deploying contract: ${err.message}`);
    return null;
  } finally {
    mongoose.connection.close();
    console.log("📌 MongoDB connection closed");
  }
}

// ✅ Parse command line arguments to decide what to do
const args = process.argv.slice(2);

if (args.includes('--deploy')) {
  console.log("🚀 Deploying new contract...");
  deployNewContract();
} else if (args.includes('--verify')) {
  console.log("🔍 Verifying hashes on the blockchain...");
  verifyComplaintHashes();
} else if (args.includes('--record-contract')) {
  const txHash = args[args.indexOf('--record-contract') + 1];
  const contractAddress = args[args.indexOf('--record-contract') + 2];
  const deployedBy = configuredWalletAddress || "unknown";
  
  if (!txHash || !contractAddress) {
    console.error("❌ Please provide transaction hash and contract address: node storeMongoData.js --record-contract <txHash> <contractAddress>");
    process.exit(1);
  }
  
  console.log(`📝 Recording existing contract deployment: ${contractAddress}`);
  recordContractDeployment(contractAddress, txHash, deployedBy)
    .then(() => mongoose.connection.close());
} else {
  console.log("🔄 Syncing complaints to blockchain...");
  syncComplaintsToBlockchain();
}