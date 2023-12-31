// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/IShogunToken.sol";

contract ShogunStakingPolygon is
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IShogunToken;

    IShogunToken public SHO;

    uint256 public startDate;

    mapping(uint256 => uint256) public claimedTimes;

    struct ClaimRequest {
        address staker;
        uint256[] nftIds;
    }
    mapping(bytes32 => ClaimRequest) public requests;
    mapping(address => uint256) public nonces;

    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    //events
    event SubmitRequest(
        bytes32 requestId,
        address indexed owner,
        uint256[] tokenIds
    );
    event Claim(uint256[] tokenIds, uint256 amount);

    function __ShogunStakingPolygon_init(
        address _gnosisAdmin,
        address _controller,
        address _SHO,
        uint256 _startTime
    ) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();

        // Constructor init
        _setupRole(DEFAULT_ADMIN_ROLE, _gnosisAdmin); // To revoke access after functions are set
        _setupRole(CONTROLLER_ROLE, _controller);
        SHO = IShogunToken(_SHO);
        startDate = _startTime;
    }

    /// @dev emit event to verify claim request
    function _submitRequest(uint256[] memory _tokenIds, address _account)
        private
        returns (bytes32)
    {
        bytes32 requestId = keccak256(
            abi.encodePacked(_account, _tokenIds, ++nonces[msg.sender])
        );
        requests[requestId] = ClaimRequest(_account, _tokenIds);

        emit SubmitRequest(requestId, _account, _tokenIds);
        return requestId;
    }

    /// @dev Claim SHO reward for verified request
    function confirmRequest(bytes32 _requestId)
        external
        onlyRole(CONTROLLER_ROLE)
        nonReentrant
    {
        ClaimRequest memory req = requests[_requestId];
        uint256[] memory tokenIds = req.nftIds;
        uint256 reward;

        for (uint256 i; i < tokenIds.length; i++) {
            reward += calculateRewardByTokenId(tokenIds[i]);
            claimedTimes[tokenIds[i]] = block.timestamp;
        }
        
        SHO.safeTransfer(req.staker, reward);

        delete requests[_requestId];

        emit Claim(tokenIds, reward);
    }

    /// @dev Caluclate rewards for given token Ids
    function calculateRewards(uint256[] memory tokenIds)
        public
        view
        returns (uint256 rewardAmount)
    {
        for (uint256 i; i < tokenIds.length; i++) {
            rewardAmount += calculateRewardByTokenId(tokenIds[i]);
        }
    }

    function calculateRewardByTokenId(uint256 _tokenId)
        private
        view
        returns (uint256)
    {
        uint256 userLastClaim = claimedTimes[_tokenId];
        if (userLastClaim < startDate) {
            userLastClaim = startDate;
        }
        return (((block.timestamp - userLastClaim) / 1 hours) * 10**18) / 24;
    }

    function claimRewards(uint256[] memory _tokenIds) external nonReentrant {
        _submitRequest(_tokenIds, msg.sender);
    }

    function setSHOToken(address _sho) public onlyRole(DEFAULT_ADMIN_ROLE) {
        SHO = IShogunToken(_sho);
    }
}
