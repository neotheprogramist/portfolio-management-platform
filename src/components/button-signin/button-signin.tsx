import { type QRL, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  text?: string;
  border?: string;
  class?: string;
  background?: string;
  width?: string;
  onClick$?: QRL<() => Promise<void>>;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "h-12 cursor-pointer rounded-[48px] border-2",
        props.background,
        props.border,
        props.width,
      )}
    >
      <div class={props.class}>{props.text}</div>
    </button>
  );
});
