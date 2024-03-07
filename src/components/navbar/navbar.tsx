import { component$, Slot } from "@builder.io/qwik";
import Logo from "/public/images/logo.png?jsx";
import { twMerge } from "tailwind-merge";

export interface NavbarProps {
  class?: string;
}

export const Navbar = component$<NavbarProps>((props) => {
  return (
    <>
      <div
        class={twMerge(
          "grid h-[80px] grid-cols-[1fr_2fr_1fr] items-center justify-between px-6 text-xs text-gray-400",
          props.class,
        )}
      >
        <div class="h-[20px] w-[94px]">
          <Logo />
        </div>
        <Slot />
      </div>
    </>
  );
});
