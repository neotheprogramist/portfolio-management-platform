import { component$, Slot, type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  class?: string;
  text?: string;
  onClick$?: QRL<() => void>;
  isDisabled?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "h-12 cursor-pointer rounded-[48px] bg-[#2196F3] px-6 text-sm text-white duration-300 ease-in-out hover:scale-105",
        props.class,
      )}
      disabled={props.isDisabled}
      type={props.type}
    >
      <Slot />
      {props.text}
    </button>
  );
});
