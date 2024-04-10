import { component$, Slot } from "@builder.io/qwik";
import IconLogo from "/public/assets/icons/logo.svg?jsx";
import { twMerge } from "tailwind-merge";

export interface NavbarProps {
  class?: string;
}

export const Navbar = component$<NavbarProps>((props) => {
  return (
    <>
      <div
        class={twMerge(
          "custom-shadow custom-border-1-b flex h-[80px] items-center justify-between px-[40px] text-[12px]",
          props.class,
        )}
      >
        <div class="h-[20px] w-[94px]">
          <IconLogo />
        </div>
        <Slot />
      </div>
    </>
  );
});
