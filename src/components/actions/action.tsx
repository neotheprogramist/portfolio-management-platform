import { component$ } from "@builder.io/qwik";
import ImgCheck from "/public/images/check.svg?jsx";

export const Action = component$(() => {
  return (
    <>
      <div class="flex items-center justify-between custom-border-b-1 py-[20px]">
        <div class="">
          <h3 class="text-sm">Automation name #1</h3>
          <p class="text-xs custom-text-50">6 hours ago</p>
        </div>
        <div class="custom-bg-white flex h-[28px] items-center gap-[4px] rounded-[8px] border border-[#24a148] p-[8px]">
          <ImgCheck />
          <p class="text-xs text-[#24a148] lg:hidden">Success</p>
        </div>
      </div>
    </>
  );
});
