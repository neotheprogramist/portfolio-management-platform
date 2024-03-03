import { component$ } from "@builder.io/qwik";

export const ButtonCancel = component$(() => {
  return (
    <button class="font-sora cursor-pointer rounded-full border-2 border-white border-opacity-15 bg-black p-4 text-white">
      Cancel
    </button>
  );
});
