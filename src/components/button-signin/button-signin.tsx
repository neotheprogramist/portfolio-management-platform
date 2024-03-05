import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  text?: string;
  border?: string;
  class?: string
  background?: string
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button class={twMerge("cursor-pointer rounded-[48px] border-2 px-[24px] py-[19px]", props.background, props.border)}>
      <div class={props.class}>{props.text}</div>
    </button>
  );
});
