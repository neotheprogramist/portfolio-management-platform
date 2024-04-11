import { server$ } from "@builder.io/qwik-city";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import Moralis from "moralis";

let _stream: any;

export async function getStream() {
  console.log("--> Stream from getStream", _stream);
  if (!_stream) {
    throw new Error("Stream not set");
  }
  return _stream;
}

export async function initializeStreamIfNeeded(factory: () => Promise<any>) {
  if (!_stream) {
    _stream = await factory();
    console.log(
      "--> Stream in initializeStreamIfNeeded after initialization",
      _stream,
    );
  }
}

export const setupStream = server$(async function () {
  const balanceOfSenderABI = {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [
      { internalType: "uint256", name: "fromBalance", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  };

  const balanceOfReceiverABI = {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "toBalance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  };

  const triggerFrom = {
    contractAddress: "$contract",
    functionAbi: balanceOfSenderABI,
    inputs: ["$from"],
    type: "erc20transfer" as const,
  };

  const triggerTo = {
    contractAddress: "$contract",
    functionAbi: balanceOfReceiverABI,
    inputs: ["$to"],
    type: "erc20transfer" as const,
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

  const moralisApiKey = this.env.get("MORALIS_API_KEY");
  if (!moralisApiKey) {
    console.error("MORALIS_API_KEY is not set in the environment variables.");
    return;
  }
  if (!Moralis.Core.isStarted) {
    Moralis.start({
      apiKey: this.env.get("MORALIS_API_KEY"),
    })
  }

  const ngrokWebhookUrl = this.env.get("NGROK_WEBHOOK_URL");
  if (!ngrokWebhookUrl) {
    console.error("NGROK_WEBHOOK_URL is not set in the environment variables.");
    return;
  }

  const streams = await Moralis.Streams.getAll({
    limit: 10,
  });
  const jsonStream = streams
    .toJSON()
    .result.find((s) => s.webhookUrl === this.env.get("NGROK_WEBHOOK_URL"));

  let newStream;

  if (jsonStream != undefined) {
    newStream = await Moralis.Streams.getById({
      id: jsonStream.id,
    });
  } else {
    newStream = await Moralis.Streams.add({
      chains: [EvmChain.SEPOLIA],
      description: "Listen for Transfers",
      tag: "transfers",
      abi: ERC20TransferABI,
      includeContractLogs: true,
      topic0: ["Transfer(address,address,uint256)"],
      includeNativeTxs: false,
      webhookUrl: ngrokWebhookUrl,
      triggers: triggers,
    });
  }

  _stream = newStream;
  console.log("-->Stream in setupStream", _stream);
  return newStream;
});
