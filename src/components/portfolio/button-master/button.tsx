import { component$, QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  image?: string;
  text?: string;
  newClass?: string;
  onClick$?: QRL<() => void>;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "flex h-[32px] items-center justify-center gap-[8px] rounded-[4px] bg-[#E9E9E9] px-[8px] text-[12px]",
        props.newClass,
      )}
    >
      {props.image && <img src={props.image} width="16" height="16" />}
      <span>{props.text}</span>
    </button>
  );
});
