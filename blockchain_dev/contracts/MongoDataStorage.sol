// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MongoDataStorage {
    string[] public hashes;           // Array to store all hashes
    mapping(string => bool) public isStored;  // To prevent duplicates (optional)

    event HashStored(string hash, uint256 timestamp); // Event for logging

    // ✅ Store a new hash
    function storeHash(string memory _hash) public {
        require(!isStored[_hash], "Hash already stored"); // Optional: prevent duplicates

        hashes.push(_hash);
        isStored[_hash] = true;

        emit HashStored(_hash, block.timestamp); // Emit event
    }

    // ✅ Get total number of stored hashes
    function getHashCount() public view returns (uint256) {
        return hashes.length;
    }

    // ✅ Get a hash by index
    function getHash(uint256 index) public view returns (string memory) {
        require(index < hashes.length, "Index out of bounds");
        return hashes[index];
    }

    // ✅ Check if a hash exists (frontend can call this)
    function checkHashExists(string memory _hash) public view returns (bool) {
        return isStored[_hash];
    }
    
    // ✅ Verify a hash exists (alias for checkHashExists for compatibility)
    function verifyHash(string memory _hash) public view returns (bool) {
        return isStored[_hash];
    }
}
