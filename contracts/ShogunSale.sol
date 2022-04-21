// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./interfaces/IShogunToken.sol";
import "./interfaces/IShogunNFT.sol";

contract ShogunSale is 
    AccessControlUpgradeable, 
    PausableUpgradeable
{
    IShogunNFT public shogunNFT;
    uint256 public saleStartDate;

    struct ShogunSaleInfo {
        address seller;
        uint256 priceUcd;
        uint256 priceSho;
        bool isOpenForSale;
    }

    mapping(uint256 => ShogunSaleInfo) public shogunSales;

    struct PurchaseRequest {
        address buyer;
        uint256 tokenId;
        uint8 UcdOrSho;
    }
    mapping(bytes32 => PurchaseRequest) public requests;
    mapping(address => uint256) public nonces;

    bytes32 public constant CONTROLLER_ROLE = keccak256("CONTROLLER_ROLE");

    event OpenForSale(uint256 indexed tokenId);
    event CloseForSale(uint256 indexed tokenId);
    event PriceSet(uint256 indexed tokenId, uint256 priceUcd, uint256 priceSho);
    event SubmitPurchase(bytes32 requestId, address indexed seller, uint256 tokenId, uint8 UcdOrSho, uint256 price);
    event ConfirmPurchase(uint256 indexed tokenId, address indexed seller, address indexed buyer);

    function __ShogunSale_init(
        address _gnosisAdmin,
        address _controller,
        IShogunNFT _shogunNFT,
        uint256 _saleStartDate
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();

        // Constructor init
        _setupRole(DEFAULT_ADMIN_ROLE, _gnosisAdmin); // To revoke access after functions are set
        _setupRole(CONTROLLER_ROLE, _controller);
        shogunNFT = _shogunNFT;
        saleStartDate = _saleStartDate;
    }

    modifier saleIsOpen() {
        require(!paused() && block.timestamp >= saleStartDate, "ShogunNFTSale: SALE_NOT_OPEN");
        _;
    }

    /// @dev Set `saleStartDate`
    /// `saleStartDate` must be greater than current timestamp
    function setSaleStartDate(uint256 _saleStartDate) external onlyRole(CONTROLLER_ROLE) {
        require(saleStartDate > block.timestamp, "ShogunNFTSale: SALE_STARTED");
        require(_saleStartDate > block.timestamp, "ShogunNFTSale: SALE_START_DATE_INVALID");
        saleStartDate = _saleStartDate;
    }

    /// @dev Set shogun price in Ucd and Sho
    /// Accessible by only shogun owner
    /// `_tokenID` must exist
    /// `_priceUcd` and `_priceSho` must not be zero at the same time
    function setPrice(
        uint256 _tokenID,
        uint256 _priceUcd,
        uint256 _priceSho
    ) external saleIsOpen {
        require(msg.sender == shogunNFT.ownerOf(_tokenID), "ShogunNFTSale: CALLER_NO_TOKEN_OWNER__ID_INVALID");
        ShogunSaleInfo storage shoSale = shogunSales[_tokenID];
        require(msg.sender == shoSale.seller, "ShogunNFTSale: OWNERSHIP_CHANGED");
        _setPrice(_tokenID, _priceUcd, _priceSho);
    }

    /// @dev Open `_tokenID` for sale
    /// Accessible by only shogun owner
    /// `_tokenID` must exist
    /// `_priceUcd` and `_priceSho` must not be zero at the same time
    function openForSale(
        uint256 _tokenID,
        uint256 _priceUcd,
        uint256 _priceSho
    ) 
        external 
        saleIsOpen 
    {
        require(msg.sender == shogunNFT.ownerOf(_tokenID), "ShogunNFTSale: CALLER_NO_TOKEN_OWNER__ID_INVALID");

        ShogunSaleInfo storage shoSale = shogunSales[_tokenID];
        // clear prices
        shoSale.priceUcd = 0;
        shoSale.priceSho = 0;

        _setPrice(_tokenID, _priceUcd, _priceSho);
        shoSale.seller = msg.sender;
        shoSale.isOpenForSale = true;

        emit OpenForSale(_tokenID);
    }

    function _setPrice(
        uint256 _tokenID, 
        uint256 _priceUcd, 
        uint256 _priceSho
    ) 
        private 
    {
        require(_priceUcd > 0 || _priceSho > 0, "ShogunNFTSale: PRICES_INVALID");
        ShogunSaleInfo storage shoSale = shogunSales[_tokenID];

        if (_priceUcd > 0) {
            shoSale.priceUcd = _priceUcd;
        }

        if (_priceSho > 0) {
            shoSale.priceSho = _priceSho;
        }

        emit PriceSet(_tokenID, _priceUcd, _priceSho);
    }

    /// @dev Close `_tokenID` for sale
    /// Accessible by only shogun owner
    /// `_tokenID` must exist
    function closeForSale(uint256 _tokenID) 
        external 
    {
        require(msg.sender == shogunNFT.ownerOf(_tokenID), "ShogunNFTSale: CALLER_NO_TOKEN_OWNER__ID_INVALID");
        shogunSales[_tokenID].isOpenForSale = false;

        emit CloseForSale(_tokenID);
    }

    /// @dev Purchase `_tokenID`
    /// Collect royalty fee and send to passport creator
    /// `_tokenID` must exist
    /// `_tokenID` must be open for sale
    /// `_ethOrSho` must be 0 or 1, 0 - purchase with Ucd, 1 - purchase with Sho
    function purchase(
        uint256 _tokenID, 
        uint8 _UcdOrSho
    ) 
        external 
        saleIsOpen 
    {
        ShogunSaleInfo memory shoSale = shogunSales[_tokenID];

        address shogunOwner = shogunNFT.ownerOf(_tokenID);
        require(shogunOwner != address(0), "ShogunNFTSale: SHOGUN_ID_INVALID");
        require(shogunOwner != msg.sender, "ShogunNFTSale: NO_SELF_PURCHASE");
        require(shogunOwner == shoSale.seller, "ShogunNFTSale: OWNERSHIP_CHANGED");

        bool isOpenForSale = shoSale.isOpenForSale;
        require(isOpenForSale, "ShogunNFTSale: SHOGUN_CLOSED_FOR_SALE");

        require(_UcdOrSho < 2, "ShogunNFTSale: UCD_OR_SHO_FLAG_INVALID");

        uint256 price;
        if (_UcdOrSho == 0) {
            price = shoSale.priceUcd;
        }
        if (_UcdOrSho == 1) {
            price = shoSale.priceSho;
        }

        bytes32 requestId = keccak256(
            abi.encodePacked(msg.sender, _tokenID, _UcdOrSho, price, ++nonces[msg.sender])
        );
        requests[requestId] = PurchaseRequest(msg.sender, _tokenID, _UcdOrSho);

        emit SubmitPurchase(requestId, msg.sender, _tokenID, _UcdOrSho, price);
    }

    function confirmPurchase(bytes32 _requestId)
        external
        onlyRole(CONTROLLER_ROLE)
    {
        PurchaseRequest memory req = requests[_requestId];
        uint256 tokenId = req.tokenId;
        ShogunSaleInfo memory shoSale = shogunSales[tokenId];
        address seller = shoSale.seller;
        address buyer = req.buyer;

        delete requests[_requestId];
        delete shogunSales[tokenId];

        shogunNFT.safeTransferFrom(seller, buyer, tokenId);

        emit ConfirmPurchase(tokenId, seller, buyer);
    }

    /// @dev Pause the contract
    function pause() 
        external 
        onlyRole(CONTROLLER_ROLE) 
    {
        _pause();
    }

    /// @dev Unpause the contract
    function unpause() 
        external 
        onlyRole(CONTROLLER_ROLE) 
    {
        _unpause();
    }

}