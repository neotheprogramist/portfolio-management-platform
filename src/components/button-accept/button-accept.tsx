import { $, type NoSerialize, component$ } from "@builder.io/qwik";
import { type Config, watchAccount } from "@wagmi/core";
import { type Web3ModalSIWEClient } from "@web3modal/siwe";
import { type Web3Modal } from "@web3modal/wagmi/dist/types/src/client";

type ButtonAcceptProps = {
  modalStore: {
    config?: NoSerialize<Config>;
    modal?: NoSerialize<Web3Modal>;
    address?: `0x${string}`;
    chainId?: number;
    siweConfig?: NoSerialize<Web3ModalSIWEClient>;
  };
};

export const ButtonAccept = component$<ButtonAcceptProps>(({ modalStore }) => {
  const connectHandle = $(async () => {
    if (modalStore.config && modalStore.modal) {
      await modalStore.modal.open();
      watchAccount(modalStore.config, {
        onChange(data) {
          modalStore.address = data.address;
          modalStore.chainId = data.chainId;
        },
      });
    }
  });
  return (
    <button
      onClick$={() => connectHandle()}
      class="font-sora ml-4 cursor-pointer rounded-full border-none bg-transparent bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 p-1 text-white"
    >
      <div class="rounded-full bg-black p-4">Accept and Sign</div>
    </button>
  );
});
