import { component$, type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  text?: string;
  border?: string;
  class?: string;
  background?: string;
  width?: string;
  onClick$?: QRL<() => Promise<void>>;
  dataTest?: string;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "h-[48px] cursor-pointer rounded-[48px] border-2",
        props.background,
        props.border,
        props.width,
      )}
      data-test={props.dataTest ? `${props.dataTest}-button` : undefined}
    >
      <div class={props.class}>{props.text}</div>
    </button>
  );
});
