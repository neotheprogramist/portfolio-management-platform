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
          "custom-shadow custom-border-b-1 flex h-20 items-center justify-between px-10 text-xs",
          props.class,
        )}
      >
        <div class="h-5 w-[94px]">
          <IconLogo />
        </div>
        <Slot />
      </div>
    </>
  );
});
