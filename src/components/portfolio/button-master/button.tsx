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
        "flex h-8 items-center justify-center gap-2 rounded-10 bg-transparent px-4 text-xs",
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
        "custom-border-1 flex h-10 items-center justify-between gap-2 rounded-lg bg-transparent px-3 text-xs text-white ",
        props.class,
      )}
    >
      <span>{props.text}</span>
      {props.image && <img src={props.image} width="16" height="16" />}
    </button>
  );
});
