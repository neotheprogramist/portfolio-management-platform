import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  class?: string;
  text?: string;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      class={twMerge(
        "h-12 cursor-pointer rounded-[48px] bg-[#2196F3] px-6 text-sm text-white duration-300 ease-in-out hover:scale-105",
      )}
    >
      {props.text}
    </button>
  );
});
