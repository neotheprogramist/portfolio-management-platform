import {
  component$,
  createContextId,
  type NoSerialize,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  type ModalStore,
  ModalStoreContext,
} from "~/interface/modal/ModalStore";

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
    address: undefined,
    chainId: undefined,
    isConnected: undefined,
    config: undefined,
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
