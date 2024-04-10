import { component$ } from "@builder.io/qwik";
import IconSuccess from "/public/assets/icons/dashboard/success.svg?jsx";

export const Action = component$(() => {
  return (
    <>
      <div class="custom-border-b-1 flex items-center justify-between py-[20px]">
        <div class="">
          <h3 class="text-sm">Automation name #1</h3>
          <p class="custom-text-50 text-xs">6 hours ago</p>
        </div>
        <div class="custom-bg-white flex h-[28px] items-center gap-[4px] rounded-[8px] border border-[#24a148] p-[8px]">
          <IconSuccess />
          <p class="text-xs text-[#24a148] lg:hidden">Success</p>
        </div>
      </div>
    </>
  );
});
