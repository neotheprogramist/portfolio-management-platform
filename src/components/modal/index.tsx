import { type Signal, Slot, component$ } from "@builder.io/qwik";

interface ModalProps {
  title: string;
  isOpen: Signal<boolean>;
}

export const Modal = component$<ModalProps>(({ isOpen, title = "" }) => {
  return (
    <div class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 text-black">
      <div class="min-h-2/3 relative w-1/3 rounded-lg bg-white p-4">
        <div class="flex justify-between">
          <div>{title}</div>
          <button
            class="cursor-pointer"
            onClick$={() => {
              isOpen.value = !isOpen.value;
            }}
          >
            X
          </button>
        </div>
        <Slot />
      </div>
    </div>
  );
});
