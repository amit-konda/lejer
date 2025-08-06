// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LedgerboundBook
 * @dev ERC721 token representing a book with royalty support
 */
contract LedgerboundBook is ERC721, ERC2981, Ownable {
    uint256 private _tokenIds;
    
    // Mapping from token ID to book metadata
    mapping(uint256 => BookMetadata) public bookMetadata;
    
    // Whitelisted marketplace address that can mint tokens
    address public marketplaceAddress;
    
    // Book metadata structure
    struct BookMetadata {
        string title;
        string author;
        string description;
        string coverImage;
        uint256 price;
        uint256 maxSupply;
        uint256 currentSupply;
        bool isActive;
    }

    event BookMinted(uint256 indexed tokenId, address indexed owner, string title);
    event MarketplaceAddressUpdated(address indexed oldAddress, address indexed newAddress);

    constructor(
        string memory name,
        string memory symbol,
        address _marketplaceAddress
    ) ERC721(name, symbol) Ownable(msg.sender) {
        marketplaceAddress = _marketplaceAddress;
    }

    /**
     * @dev Mint a new book token (only callable by whitelisted marketplace)
     * @param to The address that will own the minted token
     * @param metadata The book metadata
     */
    function mint(
        address to,
        BookMetadata memory metadata
    ) external returns (uint256) {
        require(msg.sender == marketplaceAddress, "Only marketplace can mint");
        require(metadata.currentSupply < metadata.maxSupply, "Max supply reached");
        require(metadata.isActive, "Book is not active");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(to, newTokenId);
        bookMetadata[newTokenId] = metadata;
        bookMetadata[newTokenId].currentSupply++;

        emit BookMinted(newTokenId, to, metadata.title);
        return newTokenId;
    }

    /**
     * @dev Update the marketplace address (only owner)
     */
    function setMarketplaceAddress(address _marketplaceAddress) external onlyOwner {
        address oldAddress = marketplaceAddress;
        marketplaceAddress = _marketplaceAddress;
        emit MarketplaceAddressUpdated(oldAddress, _marketplaceAddress);
    }

    /**
     * @dev Set royalty info for a specific token
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /**
     * @dev Set default royalty info
     */
    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev Get book metadata by token ID
     */
    function getBookMetadata(uint256 tokenId) external view returns (BookMetadata memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return bookMetadata[tokenId];
    }

    /**
     * @dev Get total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Required override for ERC721 and ERC2981 compatibility
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        // For MVP, return a simple JSON metadata
        BookMetadata memory metadata = bookMetadata[tokenId];
        return string(abi.encodePacked(
            '{"name":"', metadata.title, '",',
            '"description":"', metadata.description, '",',
            '"image":"', metadata.coverImage, '",',
            '"attributes":[',
            '{"trait_type":"Author","value":"', metadata.author, '"},',
            '{"trait_type":"Price","value":"', _uint2str(metadata.price), '"},',
            '{"trait_type":"Supply","value":"', _uint2str(metadata.currentSupply), '/', _uint2str(metadata.maxSupply), '"}',
            ']}'
        ));
    }

    /**
     * @dev Required override for ERC721 and ERC2981 compatibility
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Helper function to convert uint to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
} 