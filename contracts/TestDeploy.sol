// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestDeploy {
    uint public value = 42;

    function getValue() public view returns (uint) {
        return value;
    }
}
