import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  image?: string;
  text?: string;
  newClass?: string;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      class={twMerge(
        "flex h-[32px] px-[8px] items-center justify-center gap-[8px] rounded-[4px] bg-[#E9E9E9] text-[12px]",
        props.newClass,
      )}
    >
      {props.image && <img src={props.image} width="16" height="16" />}
      <span>{props.text}</span>
    </button>
  );
});
