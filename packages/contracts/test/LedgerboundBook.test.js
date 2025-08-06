const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LedgerboundBook", function () {
  let LedgerboundBook;
  let ledgerboundBook;
  let owner;
  let marketplace;
  let buyer;
  let author;

  beforeEach(async function () {
    [owner, marketplace, buyer, author] = await ethers.getSigners();
    
    LedgerboundBook = await ethers.getContractFactory("LedgerboundBook");
    ledgerboundBook = await LedgerboundBook.deploy(
      "Ledgerbound Books",
      "LBOOK",
      marketplace.address
    );
    await ledgerboundBook.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ledgerboundBook.owner()).to.equal(owner.address);
    });

    it("Should set the marketplace address", async function () {
      expect(await ledgerboundBook.marketplaceAddress()).to.equal(marketplace.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await ledgerboundBook.name()).to.equal("Ledgerbound Books");
      expect(await ledgerboundBook.symbol()).to.equal("LBOOK");
    });
  });

  describe("Minting", function () {
    const bookMetadata = {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A classic American novel",
      coverImage: "https://example.com/cover.jpg",
      price: ethers.parseEther("0.1"),
      maxSupply: 100,
      currentSupply: 0,
      isActive: true
    };

    it("Should allow marketplace to mint", async function () {
      await ledgerboundBook.connect(marketplace).mint(buyer.address, bookMetadata);
      
      expect(await ledgerboundBook.ownerOf(1)).to.equal(buyer.address);
      expect(await ledgerboundBook.totalSupply()).to.equal(1);
    });

    it("Should not allow non-marketplace to mint", async function () {
      await expect(
        ledgerboundBook.connect(buyer).mint(buyer.address, bookMetadata)
      ).to.be.revertedWith("Only marketplace can mint");
    });

    it("Should store book metadata correctly", async function () {
      await ledgerboundBook.connect(marketplace).mint(buyer.address, bookMetadata);
      
      const storedMetadata = await ledgerboundBook.getBookMetadata(1);
      expect(storedMetadata.title).to.equal(bookMetadata.title);
      expect(storedMetadata.author).to.equal(bookMetadata.author);
      expect(storedMetadata.currentSupply).to.equal(1);
    });

    it("Should increment token IDs correctly", async function () {
      await ledgerboundBook.connect(marketplace).mint(buyer.address, bookMetadata);
      await ledgerboundBook.connect(marketplace).mint(buyer.address, bookMetadata);
      
      expect(await ledgerboundBook.ownerOf(1)).to.equal(buyer.address);
      expect(await ledgerboundBook.ownerOf(2)).to.equal(buyer.address);
      expect(await ledgerboundBook.totalSupply()).to.equal(2);
    });

    it("Should not mint if max supply reached", async function () {
      const limitedMetadata = { ...bookMetadata, maxSupply: 1, currentSupply: 1 };
      
      await expect(
        ledgerboundBook.connect(marketplace).mint(buyer.address, limitedMetadata)
      ).to.be.revertedWith("Max supply reached");
    });

    it("Should not mint if book is not active", async function () {
      const inactiveMetadata = { ...bookMetadata, isActive: false };
      
      await expect(
        ledgerboundBook.connect(marketplace).mint(buyer.address, inactiveMetadata)
      ).to.be.revertedWith("Book is not active");
    });
  });

  describe("Marketplace Management", function () {
    it("Should allow owner to update marketplace address", async function () {
      const newMarketplace = buyer.address;
      
      await ledgerboundBook.setMarketplaceAddress(newMarketplace);
      expect(await ledgerboundBook.marketplaceAddress()).to.equal(newMarketplace);
    });

    it("Should not allow non-owner to update marketplace address", async function () {
      await expect(
        ledgerboundBook.connect(buyer).setMarketplaceAddress(buyer.address)
      ).to.be.reverted;
    });
  });

  describe("Royalties", function () {
    it("Should allow owner to set default royalty", async function () {
      const receiver = author.address;
      const feeNumerator = 500; // 5%
      
      await ledgerboundBook.setDefaultRoyalty(receiver, feeNumerator);
      
      const royaltyInfo = await ledgerboundBook.royaltyInfo(1, ethers.parseEther("1"));
      expect(royaltyInfo[0]).to.equal(receiver);
      expect(royaltyInfo[1]).to.equal(ethers.parseEther("0.05"));
    });

    it("Should allow owner to set token-specific royalty", async function () {
      const receiver = author.address;
      const feeNumerator = 1000; // 10%
      
      await ledgerboundBook.setTokenRoyalty(1, receiver, feeNumerator);
      
      const royaltyInfo = await ledgerboundBook.royaltyInfo(1, ethers.parseEther("1"));
      expect(royaltyInfo[0]).to.equal(receiver);
      expect(royaltyInfo[1]).to.equal(ethers.parseEther("0.1"));
    });
  });

  describe("Token URI", function () {
    const bookMetadata = {
      title: "Test Book",
      author: "Test Author",
      description: "Test Description",
      coverImage: "https://example.com/test.jpg",
      price: ethers.parseEther("0.1"),
      maxSupply: 100,
      currentSupply: 0,
      isActive: true
    };

    it("Should return valid JSON metadata", async function () {
      await ledgerboundBook.connect(marketplace).mint(buyer.address, bookMetadata);
      
      const tokenURI = await ledgerboundBook.tokenURI(1);
      const metadata = JSON.parse(tokenURI);
      
      expect(metadata.name).to.equal(bookMetadata.title);
      expect(metadata.description).to.equal(bookMetadata.description);
      expect(metadata.image).to.equal(bookMetadata.coverImage);
      expect(metadata.attributes).to.have.lengthOf(3);
    });

    it("Should revert for non-existent token", async function () {
      await expect(ledgerboundBook.tokenURI(999)).to.be.reverted;
    });
  });

  describe("Interface Support", function () {
    it("Should support ERC721 interface", async function () {
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await ledgerboundBook.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it("Should support ERC2981 interface", async function () {
      const ERC2981_INTERFACE_ID = "0x2a55205a";
      expect(await ledgerboundBook.supportsInterface(ERC2981_INTERFACE_ID)).to.be.true;
    });
  });
}); 