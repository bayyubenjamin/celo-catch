// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFishingRod { 
    function balanceOf(address a, uint256 id) external view returns (uint256); 
}

contract CeloCatchCore is Ownable {
    IFishingRod public rodContract;
    mapping(address => uint256) public playerXP;
    mapping(address => uint256) public playerRod; // ID pancing yang dipakai

    event FishCaught(address indexed player, uint8 fishType, uint256 xp);

    constructor(address _rodContract) Ownable(msg.sender) {
        rodContract = IFishingRod(_rodContract);
    }

    function equipRod(uint256 rodId) external {
        require(rodContract.balanceOf(msg.sender, rodId) > 0, "Tidak punya pancing ini");
        playerRod[msg.sender] = rodId;
    }

    function recordCatch() external {
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))) % 100;
        uint8 fT; uint256 xp;
        if (random < 45) { fT = 1; xp = 10; } 
        else if (random < 70) { fT = 2; xp = 25; }
        else if (random < 85) { fT = 3; xp = 75; }
        else if (random < 94) { fT = 4; xp = 150; }
        else if (random < 99) { fT = 5; xp = 350; }
        else { fT = 6; xp = 1000; }

        uint256 bonus = (playerRod[msg.sender] == 2) ? 50 : (playerRod[msg.sender] == 3 ? 200 : 0);
        playerXP[msg.sender] += (xp + bonus);
        emit FishCaught(msg.sender, fT, xp + bonus);
    }
}
