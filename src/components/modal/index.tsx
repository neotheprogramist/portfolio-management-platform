import { type Signal, Slot, component$ } from "@builder.io/qwik";
import IconClose from "/public/assets/icons/close.svg?jsx";

interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
  formStore?: {
    name: string;
    address: string;
    privateKey: string;
  };
}

export const Modal = component$<ModalProps>(
  ({ isOpen, title = "", formStore = undefined }) => {
    return (
      <div
        onClick$={() => {
          isOpen.value = false;
          if (formStore) {
            formStore.name = "";
            formStore.address = "";
            formStore.privateKey = "";
          }
        }}
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-40"
      >
        <div
          onClick$={(event) => {
            event.stopPropagation();
          }}
          class="bg-modal-glass border-white-opacity-20 relative h-5/6 w-1/3 rounded-xl"
        >
          <div class="flex items-center justify-between p-5">
            <div class="text-lg text-white">{title}</div>
            <button
              class="cursor-pointer"
              onClick$={() => {
                isOpen.value = !isOpen.value;
                if (formStore) {
                  formStore.name = "";
                  formStore.address = "";
                  formStore.privateKey = "";
                }
              }}
            >
              <IconClose />
            </button>
          </div>
          <hr class="opacity-20" />
          <Slot />
        </div>
      </div>
    );
  },
);
