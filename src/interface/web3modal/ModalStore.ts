import { type NoSerialize, createContextId } from "@builder.io/qwik";
import { type Config } from "@wagmi/core";

export interface ModalStore {
  isConnected?: boolean;
  config?: NoSerialize<Config>;
}

export const ModalStoreContext = createContextId<ModalStore>(
  "modal-store-context",
);
