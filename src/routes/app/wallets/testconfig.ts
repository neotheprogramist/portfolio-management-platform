import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";

export const testPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const testWalletClient = createWalletClient({
  chain: sepolia,
  transport: http(),
});
