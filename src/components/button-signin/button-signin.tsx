import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  text?: string;
  border?: string;
  class?: string;
  background?: string;
  width?: string;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      class={twMerge(
        "h-[48px] cursor-pointer rounded-[48px] border-2",
        props.background,
        props.border,
        props.width,
      )}
    >
      <div class={props.class}>{props.text}</div>
    </button>
  );
});
