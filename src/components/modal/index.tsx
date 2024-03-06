import { type Signal, Slot, component$ } from "@builder.io/qwik";
import ImgClose from '/public/images/svg/close.svg?jsx';

interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
}

export const Modal = component$<ModalProps>(({ isOpen, title = "" }) => {
  return (
    <div class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-40">
      <div class="relative w-1/3 h-5/6 rounded-xl bg-modal-glass border-white-opacity-20">
        <div class="flex justify-between items-center p-5">
          <div class="text-white text-lg">{title}</div>
          <button
            class="cursor-pointer"
            onClick$={() => {
              isOpen.value = !isOpen.value;
            }}
          >
            <ImgClose/>
          </button>
        </div>
        <hr class="opacity-20"/>
        <Slot />
      </div>
    </div>
  );
});
