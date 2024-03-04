import { component$, Slot } from "@builder.io/qwik";
import Logo from "/public/images/logo.png?jsx";

export const Navbar = component$(() => {
  return (
    <>
      <div class="grid grid-cols-[1fr_2fr_1fr] justify-between items-center p-6 text-xs text-gray-400">
        <div class="w-[94px] h-[20px]">
          <Logo/>
        </div>
        <Slot/>
      </div>
    </>
  );
});
