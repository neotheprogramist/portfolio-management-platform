import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
declare global {
    interface Window {
      ethereum: any
    }
  }

export const testPublicClient = createPublicClient({
  chain: mainnet,
  transport: http('http://localhost:8545')
})
 
export const testWalletClient = createWalletClient({
  chain: mainnet,
  transport: http('http://localhost:8545'),
})
 
// Local Account
export const testAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
