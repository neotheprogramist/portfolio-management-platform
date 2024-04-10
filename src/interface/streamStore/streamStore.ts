import { createContextId } from "@builder.io/qwik";

export interface ModalStore {
  streamId: string;
}

export const StreamStoreContext = createContextId<ModalStore>(
  "stream-store-context",
);
