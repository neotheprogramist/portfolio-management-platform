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
          "flex items-center justify-between h-[80px] px-[40px] text-[12px] custom-shadow custom-border-1-b",
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
