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

// ✅ Get the schemas from the original script
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

// Function to create a simple table format without dependencies
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

// Helper function to format object data for display
function formatObjectData(obj, indent = 0) {
  if (!obj) return 'N/A';
  
  const indentStr = ' '.repeat(indent);
  let output = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      output += `${indentStr}${key}:\n`;
      output += formatObjectData(value, indent + 2);
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue;
      
      output += `${indentStr}${key}: `;
      if (typeof value[0] === 'object') {
        output += '\n';
        value.forEach((item, index) => {
          output += `${indentStr}  [${index}]:\n`;
          output += formatObjectData(item, indent + 4);
        });
      } else {
        output += `${value.join(', ')}\n`;
      }
    } else {
      if (String(value).trim() === '') continue;
      output += `${indentStr}${key}: ${value}\n`;
    }
  }
  
  return output;
}

// ✅ Function to verify all hashes on the blockchain
async function verifyAllHashes() {
  try {
    // Get all records that have been confirmed
    const confirmedRecords = await BlockchainData.find({ status: 'confirmed' });
    
    if (confirmedRecords.length === 0) {
      console.log("❌ No confirmed blockchain records found in the database.");
      console.log("ℹ️ Run 'node blockchain/storeMongoData.js' first to store data on the blockchain.");
      return;
    }
    
    console.log(`🔍 Verifying ${confirmedRecords.length} confirmed records on the blockchain...`);
    
    // Prepare table data
    const headers = ['Complaint ID', 'Date Stored', 'Status', 'Blockchain Verified'];
    const rows = [];
    
    let verifiedCount = 0;
    let failedCount = 0;
    
    for (const record of confirmedRecords) {
      try {
        // Create contract instance with the stored contract address
        const contract = new web3.eth.Contract(contractABI, record.contractAddress);
        
        // Verify the hash exists on the blockchain
        const exists = await contract.methods.verifyHash(record.hash).call();
        
        if (exists) {
          verifiedCount++;
          rows.push([
            record.complaintId, 
            new Date(record.timestamp).toLocaleString(), 
            '✅ Confirmed', 
            '✅ Verified'
          ]);
        } else {
          failedCount++;
          rows.push([
            record.complaintId, 
            new Date(record.timestamp).toLocaleString(), 
            '✅ Confirmed', 
            '❌ Failed'
          ]);
          
          // Update the record with failed status
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
        failedCount++;
        rows.push([
          record.complaintId, 
          new Date(record.timestamp).toLocaleString(), 
          '✅ Confirmed', 
          '❌ Error'
        ]);
        console.error(`❌ Error verifying hash for complaint ${record.complaintId}:`, err.message);
      }
    }
    
    // Display the table
    console.log(createTable(headers, rows));
    
    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`✅ Total Records: ${confirmedRecords.length}`);
    console.log(`✅ Successfully Verified: ${verifiedCount}`);
    console.log(`❌ Failed Verification: ${failedCount}`);
    
    if (failedCount > 0) {
      console.log("\n⚠️ Some records failed verification!");
      console.log("ℹ️ This may mean the data has been tampered with or the blockchain connection is not working properly.");
    } else {
      console.log("\n✅ All blockchain records verified successfully!");
      console.log("ℹ️ This confirms data integrity and immutability of your complaints.");
    }
    
    // Instructions for viewing detailed data
    console.log("\n📌 To view detailed data for a specific complaint:");
    console.log(`  node blockchain/verifyBlockchainData.js --complaint COMPLAINT_ID`);
    console.log("\n📌 To list all stored complaints with details:");
    console.log(`  node blockchain/verifyBlockchainData.js --list`);
    
  } catch (err) {
    console.error("❌ Error during verification:", err);
  } finally {
    mongoose.connection.close();
    console.log("\n📌 MongoDB connection closed");
  }
}

// ✅ Function to get detailed info about a specific complaint
async function getComplaintDetails(complaintId) {
  try {
    const record = await BlockchainData.findOne({ 
      complaintId: complaintId,
      status: 'confirmed'
    });
    
    if (!record) {
      console.log(`❌ No confirmed blockchain record found for complaint ID: ${complaintId}`);
      return;
    }
    
    // Create contract instance with the stored contract address
    const contract = new web3.eth.Contract(contractABI, record.contractAddress);
    
    // Verify the hash exists on the blockchain
    const exists = await contract.methods.verifyHash(record.hash).call();
    
    console.log("\n📋 Complaint Blockchain Details");
    console.log("============================");
    console.log(`📝 Complaint ID: ${record.complaintId}`);
    console.log(`📅 Stored on: ${new Date(record.timestamp).toLocaleString()}`);
    console.log(`📜 Blockchain Status: ${record.status}`);
    console.log(`🔐 Hash: ${record.hash}`);
    console.log(`🔗 Contract Address: ${record.contractAddress}`);
    console.log(`📌 Transaction Hash: ${record.transactionHash}`);
    console.log(`👤 Wallet Used: ${record.walletUsed}`);
    console.log(`✅ Verified on Blockchain: ${exists ? 'Yes' : 'No'}`);
    
    if (record.complaintData) {
      console.log("\n📄 Complaint Content");
      console.log("==================");
      console.log(`📝 Text: ${record.complaintData.text}`);
      console.log(`👤 Complainant: ${record.complaintData.complainantName}`);
      console.log(`📞 Phone: ${record.complaintData.complainantPhone || 'Not provided'}`);
      console.log(`📅 Filed on: ${record.complaintData.filedAt}`);
      
      if (record.complaintData.incidentDetails) {
        console.log("\n📍 Incident Details");
        console.log("----------------");
        console.log(`📅 Date: ${record.complaintData.incidentDetails.date || 'Not provided'}`);
        console.log(`📍 Location: ${record.complaintData.incidentDetails.location || 'Not provided'}`);
        console.log(`🏷️ Category: ${record.complaintData.incidentDetails.category || 'Not provided'}`);
      }
      
      if (record.complaintData.filedBy) {
        console.log("\n👮 Filed By");
        console.log("--------");
        console.log(`🆔 ID: ${record.complaintData.filedBy.id || 'Not provided'}`);
        console.log(`👤 Name: ${record.complaintData.filedBy.name || 'Not provided'}`);
        console.log(`🏷️ Role: ${record.complaintData.filedBy.role || 'Not provided'}`);
      }
      
      if (record.complaintData.legalClassification?.ipc_sections) {
        console.log("\n⚖️ Legal Classification");
        console.log("-------------------");
        console.log(`⚖️ IPC Sections: ${record.complaintData.legalClassification.ipc_sections.join(', ')}`);
      }
      
      if (record.complaintData.analysisResult) {
        console.log("\n🔍 Analysis Result");
        console.log("---------------");
        console.log(`🚨 Cognizable: ${record.complaintData.analysisResult.isCognizable ? 'Yes' : 'No'}`);
        console.log(`📝 Summary: ${record.complaintData.analysisResult.summary || 'Not provided'}`);
        console.log(`📋 Explanation: ${record.complaintData.analysisResult.explanation || 'Not provided'}`);
        
        if (record.complaintData.analysisResult.sections && record.complaintData.analysisResult.sections.length > 0) {
          console.log("\n📚 Applicable Sections");
          console.log("-------------------");
          record.complaintData.analysisResult.sections.forEach((section, index) => {
            console.log(`\n${index + 1}. ${section.section}`);
            console.log(`   ${section.description}`);
          });
        }
      }
    }
    
    // Get transaction details from the blockchain
    try {
      const tx = await web3.eth.getTransaction(record.transactionHash);
      if (tx) {
        console.log("\n🔗 Blockchain Transaction Details");
        console.log("==============================");
        console.log(`🔢 Block Number: ${tx.blockNumber}`);
        console.log(`📌 Transaction Hash: ${tx.hash}`);
        console.log(`💰 Gas Used: ${tx.gas}`);
        
        // Try to get transaction receipt for more details
        const receipt = await web3.eth.getTransactionReceipt(record.transactionHash);
        if (receipt) {
          console.log(`⛽ Actual Gas Used: ${receipt.gasUsed}`);
          console.log(`🧾 Status: ${receipt.status ? 'Success' : 'Failed'}`);
        }
      }
    } catch (err) {
      console.log("⚠️ Could not retrieve transaction details from blockchain");
    }
    
    // Add blockchain explorer link
    console.log("\n🔍 View on Blockchain Explorer:");
    console.log(`http://localhost:7545/transactions/${record.transactionHash}`);
    
  } catch (err) {
    console.error("❌ Error getting complaint details:", err);
  } finally {
    mongoose.connection.close();
    console.log("\n📌 MongoDB connection closed");
  }
}

// ✅ Function to list all complaints with their data
async function listAllComplaints() {
  try {
    const records = await BlockchainData.find({ status: 'confirmed' }).sort({ timestamp: -1 });
    
    if (records.length === 0) {
      console.log("❌ No confirmed blockchain records found in the database.");
      return;
    }
    
    console.log(`\n📋 Found ${records.length} complaints stored on the blockchain`);
    console.log("=================================================");
    
    // First show a summary table
    const headers = ['Complaint ID', 'Complainant', 'Filed On', 'Location', 'IPC Sections'];
    const rows = records.map(record => [
      record.complaintId,
      record.complaintData?.complainantName || 'Unknown',
      new Date(record.complaintData?.filedAt || record.timestamp).toLocaleString(),
      record.complaintData?.incidentDetails?.location || 'Not specified',
      record.complaintData?.legalClassification?.ipc_sections?.join(', ') || 'None'
    ]);
    
    console.log(createTable(headers, rows));
    
    // Ask if user wants to see detailed data for a specific complaint
    console.log("\n📌 To view detailed data for a specific complaint:");
    console.log(`  node blockchain/verifyBlockchainData.js --complaint COMPLAINT_ID`);
    
    // Show list of all complaint IDs for easy copy-paste
    console.log("\n📋 All Complaint IDs:");
    records.forEach(record => {
      console.log(`  ${record.complaintId}`);
    });
    
  } catch (err) {
    console.error("❌ Error listing complaints:", err);
  } finally {
    mongoose.connection.close();
    console.log("\n📌 MongoDB connection closed");
  }
}

// ✅ Function to show contract details
async function showContractDetails() {
  try {
    const contracts = await DeployedContract.find().sort({ deployedAt: -1 });
    
    if (contracts.length === 0) {
      console.log("❌ No contracts found in the database.");
      console.log("ℹ️ Run 'node blockchain/storeMongoData.js --record-contract <txHash> <contractAddress>' to record a contract.");
      return;
    }
    
    // Prepare table data
    const headers = ['Contract Address', 'Deployed On', 'Deployed By', 'Status'];
    const rows = contracts.map(contract => [
      contract.address, 
      new Date(contract.deployedAt).toLocaleString(),
      contract.deployedBy,
      contract.isActive ? '✅ Active' : '❌ Inactive'
    ]);
    
    console.log("\n📋 Deployed Contracts");
    console.log("===================");
    console.log(createTable(headers, rows));
    
    // Show active contract
    const activeContract = contracts.find(c => c.isActive);
    if (activeContract) {
      console.log(`\n✅ Currently active contract: ${activeContract.address}`);
      
      // Get contract data from the blockchain
      try {
        const web3Contract = new web3.eth.Contract(contractABI, activeContract.address);
        const hashCount = await web3Contract.methods.getHashCount().call();
        
        console.log(`\n📊 Contract Statistics:`);
        console.log(`📝 Total Hashes Stored: ${hashCount}`);
        
        // If there are hashes, show the most recent ones
        if (Number(hashCount) > 0) {
          console.log(`\n🔍 Most Recent Hashes:`);
          const maxToShow = Math.min(5, Number(hashCount));
          
          for (let i = Number(hashCount) - 1; i >= Math.max(0, Number(hashCount) - maxToShow); i--) {
            const hash = await web3Contract.methods.getHash(i).call();
            console.log(`  - Hash #${i}: ${hash}`);
          }
        }
      } catch (err) {
        console.log(`⚠️ Could not retrieve contract data: ${err.message}`);
      }
    } else {
      console.log("\n⚠️ No active contract found!");
    }
    
  } catch (err) {
    console.error("❌ Error showing contract details:", err);
  } finally {
    mongoose.connection.close();
    console.log("\n📌 MongoDB connection closed");
  }
}

// ✅ Function to record a contract from command line
async function recordContractFromCommandLine() {
  try {
    const args = process.argv.slice(2);
    
    // First check if we are called with a contract address directly
    let contractAddress = args[0];
    
    // If not, ask for it interactively
    if (!contractAddress || !web3.utils.isAddress(contractAddress)) {
      console.log("❌ Please provide a valid contract address as the first argument.");
      console.log("Usage: node blockchain/verifyBlockchainData.js 0x123456789abcdef...");
      process.exit(1);
    }
    
    console.log(`🔍 Recording contract at address: ${contractAddress}`);
    
    // Get wallet from env
    const walletAddress = process.env.WALLET_ADDRESS;
    
    await DeployedContract.create({
      address: contractAddress,
      deployedAt: new Date(),
      deployedBy: walletAddress || "manual-entry",
      transactionHash: "manually-recorded", // We don't have the tx hash
      isActive: true
    });
    
    console.log("✅ Contract recorded successfully!");
    console.log("ℹ️ You can now use 'node blockchain/storeMongoData.js' to store complaint data.");
    
  } catch (err) {
    console.error("❌ Error recording contract:", err);
  } finally {
    mongoose.connection.close();
    console.log("\n📌 MongoDB connection closed");
  }
}

// ✅ Parse command line arguments to decide what to do
const args = process.argv.slice(2);

if (args.includes('--complaint')) {
  const complaintId = args[args.indexOf('--complaint') + 1];
  if (!complaintId) {
    console.error("❌ Please provide a complaint ID: node blockchain/verifyBlockchainData.js --complaint <complaintId>");
    process.exit(1);
  }
  console.log(`🔍 Getting details for complaint: ${complaintId}`);
  getComplaintDetails(complaintId);
} else if (args.includes('--contracts')) {
  console.log("🔍 Showing all deployed contracts...");
  showContractDetails();
} else if (args.includes('--list')) {
  console.log("📋 Listing all stored complaints...");
  listAllComplaints();
} else if (args.length > 0 && web3.utils.isAddress(args[0])) {
  // If the first argument is an address, record it as a contract
  recordContractFromCommandLine();
} else {
  console.log("🔍 Verifying all complaints on the blockchain...");
  verifyAllHashes();
}
