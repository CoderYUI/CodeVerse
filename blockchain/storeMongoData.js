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

// ✅ Web3 and Smart Contract Setup
const web3 = new Web3("http://127.0.0.1:7545"); // Ganache
const contractPath = path.resolve(__dirname, '..', 'build', 'contracts', 'MongoDataStorage.json');
const contractJSON = JSON.parse(fs.readFileSync(contractPath));
const contractABI = contractJSON.abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// ✅ Mongo Schema
const dataSchema = new mongoose.Schema({
  batchNumber: String,
  hash: String,
  timestamp: Date
});

const BlockchainData = mongoose.model('BlockchainData', dataSchema);

// ✅ Transfer All Hashes from MongoDB to Blockchain
async function syncMongoToBlockchain() {
  try {
    const dataList = await BlockchainData.find();
    const accounts = await web3.eth.getAccounts();

    console.log(`🔍 Found ${dataList.length} records to sync.`);

    for (const data of dataList) {
      console.log(`⏳ Sending hash: ${data.hash}`);
      const tx = await contract.methods.storeHash(data.hash).send({
        from: accounts[0],
        gas: 300000,
      });
      console.log(`✅ Stored on Blockchain: ${tx.transactionHash}`);
    }

  } catch (err) {
    console.error("❌ Error during sync:", err);
  } finally {
    mongoose.connection.close();
  }
}

syncMongoToBlockchain();
