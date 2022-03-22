// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/IShogunToken.sol";

contract ShogunStakingPolygon is AccessControlUpgradeable, ReentrancyGuardUpgradeable { 
    using SafeERC20 for IShogunToken;

    IShogunToken public SHO;

    uint256 public startDate;

    mapping(uint256 => uint256) public claimedTimes;

    struct ClaimRequest {
        address staker;
        uint256 nftId;
    }
    mapping(bytes32 => ClaimRequest) public requests;

    event SubmitRequest(bytes32 requestId, address indexed owner, uint256 indexed tokenId);
    event Claim(uint256 indexed tokenId, uint256 amount);

    function __ShogunStaking_init(
        address _admin,
        address _SHO
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        // Constructor init
        _setupRole(DEFAULT_ADMIN_ROLE, _admin); // To revoke access after functions are set

        SHO = IShogunToken(_SHO);
        startDate = block.timestamp;
    }

    function _submitRequest(
        uint256 _tokenId, 
        address _account
    ) private returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(_account, _tokenId, block.timestamp));
        requests[requestId] = ClaimRequest(
            msg.sender,
            _tokenId
        );

        emit SubmitRequest(requestId, msg.sender, _tokenId);
        return requestId;
    }

    function confirmRequest(bytes32 _requestId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ClaimRequest memory req = requests[_requestId];
        uint256 reward = calculateRewards(req.nftId);

        // TODO check `safeTranserFrom` 
        SHO.safeTransfer(req.staker, reward);
        claimedTimes[req.nftId] = block.timestamp;
        delete requests[_requestId];

        emit Claim(req.nftId, reward);
    }

    function calculateRewards(uint256 _tokenId) public view returns (uint256) {
        uint256 userLastClaim = claimedTimes[_tokenId];
        if (userLastClaim < startDate) {
            userLastClaim = startDate;
        }
        // TODO check offset
        return (block.timestamp - userLastClaim) / 1 days;
    }

    function claimRewards(uint256 _tokenId) external {
        _submitRequest(_tokenId, msg.sender);
    }

     function setSHOToken(address _sho) public onlyRole(DEFAULT_ADMIN_ROLE) {
        SHO = IShogunToken(_sho);
    }
}