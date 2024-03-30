import { component$, type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  image?: string;
  text?: string;
  class?: string;
  onClick$?: QRL<() => void>;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "flex h-[32px] items-center justify-center gap-[8px] rounded-[40px] bg-transparent px-[16px] text-[12px]",
        props.class,
      )}
    >
      {props.image && <img src={props.image} width="16" height="16" />}
      <span>{props.text}</span>
    </button>
  );
});

export const ButtonTokenList = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "custom-border-1 flex h-[40px] items-center justify-between gap-[8px] rounded-[8px] bg-transparent px-[12px] text-[12px] text-white ",
        props.class,
      )}
    >
      <span>{props.text}</span>
      {props.image && <img src={props.image} width="16" height="16" />}
    </button>
  );
});
