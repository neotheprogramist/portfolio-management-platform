import { component$ } from "@builder.io/qwik";

export const ButtonCancel = component$(() => {
  return (
    <button class="border-opacity-15 font-sora cursor-pointer rounded-full border-2 border-white bg-black p-4 text-white">
      Cancel
    </button>
  );
});
