const Web3 = require("web3");
const mongoose = require("mongoose");
require("dotenv").config();
const contractJson = require("../build/contracts/MongoDataStorage.json");

const CONTRACT_ABI = contractJson.abi;
const CONTRACT_ADDRESS = "0xf827F5C52269EdbdED3CedA5446c26F712E272C5"; // ✅ Deployed address

const web3 = new Web3("http://127.0.0.1:7545");
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

mongoose.connect("mongodb://localhost:27017/codeverse", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", async () => {
  console.log("✅ Connected to MongoDB");

  const Record = mongoose.model(
    "your_collection_name", // 🔁 Replace with actual collection name
    new mongoose.Schema({}, { strict: false })
  );

  try {
    const data = await Record.find({});
    const accounts = await web3.eth.getAccounts();

    for (const record of data) {
      const id = record._id.toString();
      const jsonData = JSON.stringify(record);

      try {
        await contract.methods
          .storeData(id, jsonData)
          .send({ from: accounts[0] });

        console.log(`✅ Stored on-chain: ${id}`);
      } catch (err) {
        console.error(`❌ Error storing ${id}: ${err.message}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  }
});
