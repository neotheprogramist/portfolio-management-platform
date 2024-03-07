import { type Signal, Slot, component$ } from "@builder.io/qwik";
import ImgClose from "/public/images/svg/close.svg?jsx";

interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
}

export const Modal = component$<ModalProps>(({ isOpen, title = "" }) => {
  return (
    <div class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-40">
      <div class="bg-modal-glass border-white-opacity-20 relative h-5/6 w-1/3 rounded-xl">
        <div class="flex items-center justify-between p-5">
          <div class="text-lg text-white">{title}</div>
          <button
            class="cursor-pointer"
            onClick$={() => {
              isOpen.value = !isOpen.value;
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
});
