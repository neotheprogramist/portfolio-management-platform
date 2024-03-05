import { component$, $, useContext, noSerialize } from "@builder.io/qwik";
import { mainnet, arbitrum, type Chain } from "viem/chains";
import { reconnect, watchAccount } from "@wagmi/core";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
import { createSIWEConfig } from "@web3modal/siwe";
import { SiweMessage } from "siwe";
import { type RouteLocation, useNavigate } from "@builder.io/qwik-city";
import {
  getNonceServer,
  getSessionServer,
  signOutServer,
  verifyMessageServer,
} from "~/components/wallet-connect/server";
import { Button, type ButtonProps } from "../button-login/button-login";
import { ModalStoreContext } from "~/interface/modal/ModalStore";

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

export const returnWeb3ModalAndClient = async (projectId: string) => {
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
  });
  return { config, modal };
};

export default component$<ButtonProps>((props) => {
  const nav = useNavigate();
  const modalStore = useContext(ModalStoreContext);

  const setWeb3Modal = $(async () => {
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Missing project ID");
    }
    return returnWeb3ModalAndClient(projectId);
  });

  const openWeb3Modal = $(async () => {
    const { config, modal } = await setWeb3Modal();
    await modal.open();
    modalStore.config = noSerialize(config);
    console.log("modalStore.config", modalStore.config);
    watchAccount(config, {
      onChange(data) {
        console.log(data);
        modalStore.isConnected = data.isConnected;
        modalStore.address = data.address;
        modalStore.chainId = data.chainId;
        modalStore.isConnected && nav("/signin");
      },
    });
  });

  return (
    <Button
      onClick$={openWeb3Modal}
      text={props.text}
      image={props.image}
      class={props.class}
    ></Button>
  );
});
