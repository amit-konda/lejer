import { ethers } from 'ethers';

// ABI for the LedgerboundBook contract (minimal for ownership checks)
const LEDGERBOUND_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getBookMetadata(uint256 tokenId) view returns (tuple(string title, string author, string description, string coverImage, uint256 price, uint256 maxSupply, uint256 currentSupply, bool isActive))',
  'function totalSupply() view returns (uint256)'
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contractAddress: string;

  constructor() {
    const rpcUrl = process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = process.env.CONTRACT_ADDRESS!;
  }

  /**
   * Verify NFT ownership
   */
  async verifyOwnership(tokenId: number, userAddress: string): Promise<boolean> {
    try {
      const contract = new ethers.Contract(this.contractAddress, LEDGERBOUND_ABI, this.provider);
      const owner = await contract.ownerOf(tokenId);
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error('Error verifying ownership:', error);
      return false;
    }
  }

  /**
   * Get book metadata from blockchain
   */
  async getBookMetadata(tokenId: number): Promise<any> {
    try {
      const contract = new ethers.Contract(this.contractAddress, LEDGERBOUND_ABI, this.provider);
      const metadata = await contract.getBookMetadata(tokenId);
      return {
        title: metadata[0],
        author: metadata[1],
        description: metadata[2],
        coverImage: metadata[3],
        price: metadata[4].toString(),
        maxSupply: metadata[5].toString(),
        currentSupply: metadata[6].toString(),
        isActive: metadata[7]
      };
    } catch (error) {
      console.error('Error getting book metadata:', error);
      throw new Error('Failed to get book metadata from blockchain');
    }
  }

  /**
   * Verify wallet signature
   */
  verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Get total supply of NFTs
   */
  async getTotalSupply(): Promise<number> {
    try {
      const contract = new ethers.Contract(this.contractAddress, LEDGERBOUND_ABI, this.provider);
      const totalSupply = await contract.totalSupply();
      return parseInt(totalSupply.toString());
    } catch (error) {
      console.error('Error getting total supply:', error);
      return 0;
    }
  }
}

export const blockchainService = new BlockchainService(); 