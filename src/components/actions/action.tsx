import { component$, Slot } from "@builder.io/qwik";
import ImgCheck from "/public/images/check.svg?jsx";

export const Action = component$(() => {
  return (
    <>
      <div class="flex justify-between border-b border-white border-opacity-20 py-5">
        <div class="">
          <Slot />
          <h3 class="text-sm">Automation name #1</h3>
          <p class="text-xs text-white text-opacity-50">6 hours ago</p>
        </div>
        <div class="flex items-center gap-1 rounded-lg border border-green-500 p-2 bg-glass">
          <Slot />
          <ImgCheck />
          <p class="text-sm text-green-500">Success</p>
        </div>
      </div>
    </>
  );
});
