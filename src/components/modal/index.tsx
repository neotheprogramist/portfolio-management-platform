import { type Signal, Slot, component$ } from "@builder.io/qwik";
import ImgClose from "/public/images/svg/close.svg?jsx";

interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
  formStore?: {
    name: string;
    address: string;
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
          }
        }}
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-40"
      >
        <div
          onClick$={(event) => {
            event.stopPropagation();
          }}
          class="bg-modal-glass custom-border-1 relative h-5/6 w-1/3 rounded-xl"
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
                }
              }}
            >
              <ImgClose />
            </button>
          </div>
          <hr class="opacity-20" />
          <Slot />
        </div>
      </div>
    );
  },
);
