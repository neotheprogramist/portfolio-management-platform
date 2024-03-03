import { component$ } from "@builder.io/qwik";

export const Gradient = component$(() => {
  return (
    <div class="m-20 block w-24 bg-gradient-to-r from-red-700 via-pink-500 to-blue-500 opacity-100 blur-[126px] filter"></div>
  );
});
