import { createPublicClient, createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";

export const testPublicClient = createPublicClient({
  chain: mainnet,
  transport: http("http://localhost:8545"),
});

export const testWalletClient = createWalletClient({
  chain: mainnet,
  transport: http("http://localhost:8545"),
});
