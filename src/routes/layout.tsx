import {
  component$,
  Slot,
  useContextProvider,
  useStore,
  noSerialize,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { reconnect, watchAccount } from "@wagmi/core";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { type Chain, arbitrum, mainnet } from "viem/chains";
import {
  type ModalStore,
  ModalStoreContext,
} from "~/interface/web3modal/ModalStore";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  const modalStore = useStore<ModalStore>({
    isConnected: undefined,
    config: undefined,
  });
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const chains: [Chain, ...Chain[]] = [arbitrum, mainnet];
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Missing project ID");
    }
    const config2 = defaultWagmiConfig({
      chains, // required
      projectId, // required
      metadata, // required
      enableWalletConnect: true, // Optional - true by default
      enableInjected: true, // Optional - true by default
      enableEIP6963: true, // Optional - true by default
      enableCoinbase: true, // Optional - true by default
    });
    reconnect(config2);

    modalStore.config = noSerialize(config2);
    if (modalStore.config) {
      watchAccount(modalStore.config, {
        onChange(data) {
          modalStore.isConnected = data.isConnected;
        },
      });
    }
  });
  useContextProvider(ModalStoreContext, modalStore);

  return (
    <>
      <main class="h-screen overflow-auto bg-black font-['Sora'] text-white z-0">
        <Slot />
      </main>
    </>
  );
});
