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
        "flex h-[32px] items-center justify-center gap-2 rounded bg-[#E9E9E9] text-xs",
        props.newClass,
      )}
    >
      {props.image && <img src={props.image} width="16" height="16" />}
      <span>{props.text}</span>
    </button>
  );
});
