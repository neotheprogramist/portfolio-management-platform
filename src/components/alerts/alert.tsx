import { component$ } from "@builder.io/qwik";

export const Alert = component$(() => {
  return (
    <>
      <div class="border-b border-white border-opacity-10 py-[20px]">
        <h3 class="text-sm">Bitcoin share exceeded 20%</h3>
        <p class="text-xs text-white text-opacity-50">6 hours ago</p>
      </div>
    </>
  );
});
