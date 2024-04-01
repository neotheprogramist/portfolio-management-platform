import { component$, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  server$,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

import "./global.css";

export const setupStream = server$(async function () {
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
    type: "erc20transfer" as const,
  };

  const triggerTo = {
    contractAddress: "$contract",
    functionAbi: balanceOfABI,
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
  Moralis.start({
    apiKey: this.env.get("MORALIS_API_KEY"),
  });

  const ngrokWebhookUrl = this.env.get("NGROK_WEBHOOK_URL");
  if (!ngrokWebhookUrl) {
    console.error("NGROK_WEBHOOK_URL is not set in the environment variables.");
    return;
  }

  const newStream = await Moralis.Streams.add({
    chains: [EvmChain.SEPOLIA],
    description: "Listen for Transfers",
    tag: "transfers",
    abi: ERC20TransferABI,
    includeContractLogs: true,
    topic0: ["Transfer(address,address,uint256)"],
    includeNativeTxs: false,
    webhookUrl: ngrokWebhookUrl,
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
});

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
