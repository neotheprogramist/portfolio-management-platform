import { component$, $ } from "@builder.io/qwik";
import { mainnet, arbitrum, type Chain } from "viem/chains";
import { reconnect } from "@wagmi/core";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
import { createSIWEConfig } from "@web3modal/siwe";
import { SiweMessage } from "siwe";
import { type RouteLocation, useLocation } from "@builder.io/qwik-city";
import {
  getNonceServer,
  getSessionServer,
  signOutServer,
  verifyMessageServer,
} from "~/components/wallet-connect/server";
import { Button, ButtonProps } from "../button-login/button-login";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const returnSIWEConfig = (loc: RouteLocation) => {
  const siweConfig = createSIWEConfig({
    createMessage: ({ nonce, address, chainId }) =>
      new SiweMessage({
        version: "1",
        domain: loc.url.host,
        uri: loc.url.origin,
        address,
        chainId,
        nonce,
        // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
        statement: "Sign to continue...",
      }).prepareMessage(),
    getNonce: async () => {
      const { nonce } = await getNonceServer();
      return nonce;
    },
    getSession: async () => {
      const { address, chainId } = await getSessionServer();
      return { address, chainId };
    },
    verifyMessage: async ({ message, signature }) => {
      const { refreshToken } = await verifyMessageServer(message, signature);
      localStorage.setItem("refreshToken", refreshToken);
      return true;
    },
    signOut: async () => {
      await signOutServer();
      localStorage.removeItem("refreshToken");
      return true;
    },
  });
  return siweConfig;
};

export const returnWeb3ModalAndClient = async (
  projectId: string,
  loc: RouteLocation,
) => {
  const chains: [Chain, ...Chain[]] = [arbitrum, mainnet];
  const config = defaultWagmiConfig({
    chains, // required
    projectId, // required
    metadata, // required
    enableWalletConnect: true, // Optional - true by default
    enableInjected: true, // Optional - true by default
    enableEIP6963: true, // Optional - true by default
    enableCoinbase: true, // Optional - true by default
  });
  reconnect(config);
  const modal = createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    siweConfig: returnSIWEConfig(loc),
  });
  return modal;
};

export default component$<ButtonProps>((props) => {
  const loc = useLocation();

  const setWeb3Modal = $(async () => {
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Missing project ID");
    }
    const modal = await returnWeb3ModalAndClient(projectId, loc);
    return modal;
  });

  const openWeb3Modal = $(async () => {
    const modal = await setWeb3Modal();
    await modal.open();
  });

  return (
    <Button
      onClick$={openWeb3Modal}
      text={props.text}
      image={props.image}
    >
    </Button>
  );
});
