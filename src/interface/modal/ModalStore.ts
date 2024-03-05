import { type NoSerialize, createContextId } from "@builder.io/qwik";
import { type Config } from "@wagmi/core";

export interface ModalStore {
  address?: `0x${string}`;
  chainId?: number;
  isConnected?: boolean;
  config?: NoSerialize<Config>;
}

export const ModalStoreContext = createContextId<ModalStore>(
  "modal-store-context",
);
