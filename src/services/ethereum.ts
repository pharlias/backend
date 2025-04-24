import { ethers } from "ethers";
import { erc721Abi } from "viem";
import { logger } from "../utils/log";

let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contractAddress: string;

export function initializeEthereumProvider(): Promise<void> {
  const { PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

  if (!PRIVATE_KEY) {
    logger.error("PRIVATE_KEY is not defined in environment variables");
    throw new Error("PRIVATE_KEY is not defined in environment variables");
  }

  // if (!CONTRACT_ADDRESS) {
  //   logger.error("CONTRACT_ADDRESS is not defined in environment variables");
  //   throw new Error("CONTRACT_ADDRESS is not defined in environment variables");
  // }

  contractAddress = CONTRACT_ADDRESS || "";
  provider = new ethers.JsonRpcProvider("https://devnet.dplabs-internal.com");
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  if (!wallet) {
    logger.error("Failed to create wallet from private key");
    throw new Error("Failed to create wallet from private key");
  }
  if (!provider) {
    logger.error("Failed to create provider");
    throw new Error("Failed to create provider");
  }
  // if (!contractAddress) {
  //   logger.error("Failed to create contract address");
  //   throw new Error("Failed to create contract address");
  // }
  logger.success("Ethereum provider initialized successfully");
  return Promise.resolve();
}

export async function mintNFT(tokenURI: string): Promise<{
  txHash: string;
  logs: any[];
}> {
  const contract = new ethers.Contract(
    contractAddress,
    erc721Abi,
    wallet
  );

  const tx = await contract.mint(wallet.address, tokenURI);
  await tx.wait();

  const receipt = await provider.getTransactionReceipt(tx.hash);
  if (!receipt) {
    logger.error("Failed to get transaction receipt");
    throw new Error("Failed to get transaction receipt");
  }

  return {
    txHash: tx.hash,
    logs: [...(receipt.logs || [])]
  };
}

export function getWalletAddress(): string {
  return wallet.address;
}