import {
  component$,
  Slot,
  useContextProvider,
  useStore,
  noSerialize,
  useVisibleTask$,
  useTask$,
  useContext,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { reconnect, watchAccount } from "@wagmi/core";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { type Chain, arbitrum, mainnet } from "viem/chains";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import {
  type ModalStore,
  ModalStoreContext,
} from "~/interface/web3modal/ModalStore";
import {
  getStream,
  initializeStreamIfNeeded,
  setupStream,
} from "~/utils/stream";

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
  useContextProvider(StreamStoreContext, { streamId: "" });
  const streamStore = useContext(StreamStoreContext);

  useTask$(async function () {
    console.log("Setting up stream...");
    await initializeStreamIfNeeded(setupStream);
    console.log("initialized stream");
    const stream = await getStream();
    console.log("Stream", stream);
    streamStore.streamId = stream["jsonResponse"]["id"];
    console.log("stream id", streamStore.streamId);
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
      <main class="h-screen overflow-auto bg-black font-['Sora'] text-white">
        <Slot />
      </main>
    </>
  );
});
