import { type QRL, type Signal, Slot, component$ } from "@builder.io/qwik";
import IconClose from "/public/assets/icons/close.svg?jsx";

export interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
  myClass?: string;
  onClose?: QRL<() => void>;
  hasButton?: boolean;
}

export const Modal = component$<ModalProps>(
  ({ isOpen, title = "", onClose }) => {
    return (
      <div
        onClick$={() => {
          isOpen.value = false;
          if (onClose) {
            onClose();
          }
        }}
        class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-60"
      >
        <div
          onClick$={(event) => {
            event.stopPropagation();
          }}
          class="bg-modal-glass custom-border-1 relative h-fit w-1/3 rounded-xl p-6"
        >
          <div class="mb-8 flex items-center justify-between">
            <div class="text-xl font-semibold text-white">{title}</div>
            <button
              class="cursor-pointer"
              onClick$={() => {
                isOpen.value = !isOpen.value;
                if (onClose) {
                  onClose();
                }
              }}
            >
              <IconClose />
            </button>
          </div>
          <Slot />
        </div>
      </div>
    );
  },
);
