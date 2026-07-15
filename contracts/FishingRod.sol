// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FishingRod is ERC1155, Ownable {
    mapping(uint256 => uint256) public price;
    
    constructor() ERC1155("https://api.celocatch.com/rods/{id}.json") Ownable(msg.sender) {
        price[2] = 5 ether; // PRO
        price[3] = 10 ether; // LEGEND
    }

    function buyRod(uint256 id) external payable {
        if(id > 1) require(msg.value >= price[id], "Kurang Celo");
        _mint(msg.sender, id, 1, "");
    }

    function burnAndUpgrade(uint256 fromId, uint256 toId) external {
        require(balanceOf(msg.sender, fromId) >= 3, "Butuh 3 pancing");
        _burn(msg.sender, fromId, 3);
        _mint(msg.sender, toId, 1, "");
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
