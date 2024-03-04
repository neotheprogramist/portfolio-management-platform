import { component$ } from "@builder.io/qwik";

export const Gradient = component$(() => {
  return (
    <div class="w-[140px] h-[600px] bg-gradient-to-l from-red-600 to-pink-400 blur-[210px]"></div>
  );
});
