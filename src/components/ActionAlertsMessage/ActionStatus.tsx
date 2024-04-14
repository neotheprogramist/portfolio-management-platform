import { component$ } from "@builder.io/qwik";
import IconSuccess from "/public/assets/icons/dashboard/success.svg?jsx";
import IconWarning from "/public/assets/icons/dashboard/warning.svg?jsx";

export const SuccessStatus = component$(() => {
  return (
    <>
      <div class="custom-bg-white flex h-7 items-center gap-1 rounded-2 border border-customGreen p-2">
        <IconSuccess />
        <p class="text-xs text-customGreen lg:hidden">Success</p>
      </div>
    </>
  );
});

export const WarningStatus = component$(() => {
  return (
    <>
      <div class="custom-bg-white flex h-7 items-center gap-1 rounded-2 border border-customWarning p-2">
        <IconWarning />
        <p class="text-xs text-customWarning lg:hidden">Warning</p>
      </div>
    </>
  );
});
