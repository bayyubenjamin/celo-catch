// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library CeloCatchECDSA {
    error InvalidSignature();

    uint256 private constant SECP256K1_HALF_ORDER =
        0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0;

    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function recover(bytes32 hash, bytes calldata signature) internal pure returns (address signer) {
        if (signature.length != 65) revert InvalidSignature();

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        if (uint256(s) > SECP256K1_HALF_ORDER || (v != 27 && v != 28)) {
            revert InvalidSignature();
        }

        signer = ecrecover(hash, v, r, s);
        if (signer == address(0)) revert InvalidSignature();
    }
}

contract CeloCatch {
    using CeloCatchECDSA for bytes32;

    error AlreadyCastToday();
    error CatchExpired();
    error InvalidCatchDay();
    error InvalidFish();
    error InvalidNonce();
    error InvalidServerSignature();
    error NotOwner();
    error ZeroAddress();

    event FishCaught(
        address indexed player,
        uint8 fishType,
        uint256 xp,
        uint256 day,
        uint256 nonce,
        uint256 timestamp
    );
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ServerSignerUpdated(address indexed previousSigner, address indexed newSigner);

    address public owner;
    address public serverSigner;
    uint256 public totalCasts;

    mapping(address player => uint256 day) public lastCastDay;
    mapping(address player => uint256 xp) public playerXP;
    mapping(address player => uint256 casts) public playerCasts;
    mapping(uint256 nonce => bool used) public usedNonces;

    constructor(address initialServerSigner) {
        if (initialServerSigner == address(0)) revert ZeroAddress();
        owner = msg.sender;
        serverSigner = initialServerSigner;
        emit OwnershipTransferred(address(0), msg.sender);
        emit ServerSignerUpdated(address(0), initialServerSigner);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function recordCatch(
        uint8 fishType,
        uint256 xp,
        uint256 nonce,
        uint256 day,
        uint256 deadline,
        bytes calldata signature
    ) external {
        uint256 currentDay = block.timestamp / 1 days;

        if (day != currentDay) revert InvalidCatchDay();
        if (block.timestamp > deadline) revert CatchExpired();
        if (lastCastDay[msg.sender] >= currentDay) revert AlreadyCastToday();
        if (usedNonces[nonce]) revert InvalidNonce();
        if (xpForFishType(fishType) != xp) revert InvalidFish();

        bytes32 digest = keccak256(
            abi.encode(
                address(this),
                block.chainid,
                msg.sender,
                fishType,
                xp,
                nonce,
                day,
                deadline
            )
        );

        address recovered = digest.toEthSignedMessageHash().recover(signature);
        if (recovered != serverSigner) revert InvalidServerSignature();

        usedNonces[nonce] = true;
        lastCastDay[msg.sender] = currentDay;
        playerXP[msg.sender] += xp;
        playerCasts[msg.sender] += 1;
        totalCasts += 1;

        emit FishCaught(msg.sender, fishType, xp, currentDay, nonce, block.timestamp);
    }

    function canCast(address player) external view returns (bool) {
        return lastCastDay[player] < block.timestamp / 1 days;
    }

    function xpForFishType(uint8 fishType) public pure returns (uint256) {
        if (fishType == 1) return 10;
        if (fishType == 2) return 25;
        if (fishType == 3) return 75;
        if (fishType == 4) return 150;
        if (fishType == 5) return 350;
        if (fishType == 6) return 1000;
        if (fishType == 7) return 0;
        revert InvalidFish();
    }

    function setServerSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZeroAddress();
        address previousSigner = serverSigner;
        serverSigner = newSigner;
        emit ServerSignerUpdated(previousSigner, newSigner);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
