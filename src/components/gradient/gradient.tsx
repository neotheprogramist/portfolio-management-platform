import { component$ } from "@builder.io/qwik";

export const Gradient = component$(() => {
  return (
    <div class="h-[600px] w-[140px] bg-gradient-to-l from-red-600 to-pink-400 blur-[210px]"></div>
  );
});
