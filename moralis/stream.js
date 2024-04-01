import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

console.log("xd");
console.log(process.env.MORALIS_API_KEY);

const balanceOfABI = {
  inputs: [{ internalType: "address", name: "", type: "address" }],
  name: "balanceOf",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};

const triggerFrom = {
  contractAddress: "$contract",
  functionAbi: balanceOfABI,
  inputs: ["$from"],
  type: "erc20transfer",
};

const triggerTo = {
  contractAddress: "$contract",
  functionAbi: balanceOfABI,
  inputs: ["$to"],
  type: "erc20transfer",
};

const triggers = [triggerFrom, triggerTo];

const ERC20TransferABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];

async function streams() {
  const newStream = await Moralis.Streams.add({
    chains: [EvmChain.SEPOLIA],
    description: "Listen for USDC Transfers",
    tag: "transfers",
    abi: ERC20TransferABI,
    includeContractLogs: true,
    topic0: ["Transfer(address,address,uint256)"],
    includeNativeTxs: false,
    webhookUrl: "https://b5b1-83-6-164-215.ngrok-free.app/",
  });

  const { id } = newStream.toJSON();

  const address = "0xa3EA94756a6d1f6Bc4727a38fe5F7aa4d568D52E";
  await Moralis.Streams.addAddress({ address, id });
  await Moralis.Streams.update({
    id: id,
    chains: [EvmChain.SEPOLIA],
    triggers: triggers,
  });

  console.log("Stream created...");
}

streams();
