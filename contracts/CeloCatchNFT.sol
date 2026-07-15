// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

interface ICore { function playerXP(address p) external view returns (uint256); }

contract CeloCatchNFT is ERC1155 {
    ICore public core;
    mapping(address => mapping(uint256 => bool)) public hasMinted;

    constructor(address _core) ERC1155("https://api.celocatch.com/nft/{id}.json") { core = ICore(_core); }

    function mintFish(uint256 id) external {
        uint256 xp = core.playerXP(msg.sender);
        if (id == 1) require(xp >= 150, "Butuh 150 XP");
        if (id == 3) require(xp >= 2000, "Butuh 2000 XP");
        
        require(!hasMinted[msg.sender][id], "Sudah pernah mint");
        hasMinted[msg.sender][id] = true;
        _mint(msg.sender, id, 1, "");
    }
}
