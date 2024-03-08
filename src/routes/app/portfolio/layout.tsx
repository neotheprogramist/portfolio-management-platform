import { Slot, component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <>
      <div class="px-[20px] bg-[#F4F4F4] text-black grid grid-rows-[64px_auto] ">
        <Slot />
      </div>
    </>
  );
});