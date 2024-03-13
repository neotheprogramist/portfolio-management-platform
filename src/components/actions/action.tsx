import { component$ } from "@builder.io/qwik";
import ImgCheck from "/public/images/check.svg?jsx";

export const Action = component$(() => {
  return (
    <>
      <div class="flex items-center justify-between border-b border-white border-opacity-20 py-[20px]">
        <div class="">
          <h3 class="text-sm">Automation name #1</h3>
          <p class="text-xs text-white text-opacity-50">6 hours ago</p>
        </div>
        <div class="bg-glass flex h-[28px] items-center gap-1 rounded-lg border border-green-500 p-[8px] ">
          <ImgCheck />
          <p class="text-xs text-green-500 md:hidden">Success</p>
        </div>
      </div>
    </>
  );
});
