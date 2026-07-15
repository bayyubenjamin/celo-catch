// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface INFT { 
    function balanceOf(address a, uint256 id) external view returns (uint256); 
}

contract CeloCatchToken is ERC20, Ownable {
    INFT public nft;
    mapping(address => mapping(uint256 => bool)) public claimed;
    
    // Status claim per fishId (true = buka, false = tutup)
    mapping(uint256 => bool) public isClaimActive;

    constructor(address _nft) ERC20("Celo Catch", "CATCH") Ownable(msg.sender) { 
        nft = INFT(_nft); 
    }

    // FUNGSI ADMIN: Membuka atau Menutup klaim untuk ID tertentu
    function toggleClaimStatus(uint256 fishId, bool status) external onlyOwner {
        isClaimActive[fishId] = status;
    }

    function claimReward(uint256 fishId) external {
        // Cek apakah klaim sedang aktif
        require(isClaimActive[fishId], "Klaim belum dibuka oleh admin");
        
        require(nft.balanceOf(msg.sender, fishId) > 0, "Tidak punya NFT Ikan");
        require(!claimed[msg.sender][fishId], "Reward sudah diambil");
        
        claimed[msg.sender][fishId] = true;
        _mint(msg.sender, 1000 * 10**decimals());
    }
}
