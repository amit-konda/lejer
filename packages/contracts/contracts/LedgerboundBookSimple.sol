// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LedgerboundBookSimple
 * @dev Simplified ERC721 token for MVP deployment with minimal gas
 */
contract LedgerboundBookSimple is ERC721, Ownable {
    uint256 private _tokenIds;
    
    // Simplified metadata
    mapping(uint256 => string) public bookTitles;
    mapping(uint256 => string) public bookAuthors;
    
    // Whitelisted marketplace address
    address public marketplaceAddress;

    event BookMinted(uint256 indexed tokenId, address indexed owner, string title);

    constructor(
        string memory name,
        string memory symbol,
        address _marketplaceAddress
    ) ERC721(name, symbol) Ownable(msg.sender) {
        marketplaceAddress = _marketplaceAddress;
    }

    /**
     * @dev Mint a new book token (only callable by whitelisted marketplace)
     */
    function mint(
        address to,
        string memory title,
        string memory author
    ) external returns (uint256) {
        require(msg.sender == marketplaceAddress, "Only marketplace can mint");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(to, newTokenId);
        bookTitles[newTokenId] = title;
        bookAuthors[newTokenId] = author;

        emit BookMinted(newTokenId, to, title);
        return newTokenId;
    }

    /**
     * @dev Update the marketplace address (only owner)
     */
    function setMarketplaceAddress(address _marketplaceAddress) external onlyOwner {
        marketplaceAddress = _marketplaceAddress;
    }

    /**
     * @dev Get total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Get book info
     */
    function getBookInfo(uint256 tokenId) external view returns (string memory title, string memory author) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return (bookTitles[tokenId], bookAuthors[tokenId]);
    }
} 