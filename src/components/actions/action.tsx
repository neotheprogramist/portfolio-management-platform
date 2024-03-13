import { component$ } from "@builder.io/qwik";
import ImgCheck from "/public/images/check.svg?jsx";

export const Action = component$(() => {
  return (
    <>
      <div class="flex justify-between items-center border-b border-white border-opacity-20 py-[20px]">
        <div class="">
          <h3 class="text-sm">Automation name #1</h3>
          <p class="text-xs text-white text-opacity-50">6 hours ago</p>
        </div>
        <div class="bg-glass flex items-center gap-1 rounded-lg border border-green-500 p-[8px] h-[28px] ">
          <ImgCheck />
          <p class="md:hidden text-xs text-green-500">Success</p>
        </div>
      </div>
    </>
  );
});
