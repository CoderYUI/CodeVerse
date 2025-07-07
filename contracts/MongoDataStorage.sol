// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MongoDataStorage {
    mapping(bytes32 => string) public records;

    event DataStored(bytes32 indexed idHash, string data);

    function storeData(string memory _id, string memory _data) public {
        bytes32 idHash = keccak256(abi.encodePacked(_id));
        records[idHash] = _data;
        emit DataStored(idHash, _data);
    }

    function getData(string memory _id) public view returns (string memory) {
        bytes32 idHash = keccak256(abi.encodePacked(_id));
        return records[idHash];
    }
}
