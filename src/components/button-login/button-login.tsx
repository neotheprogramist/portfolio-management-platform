import { type QRL, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  image?: string;
  text?: string;
  buttonWidth?: string;
  borderColor?: string;
  padding?: string;
  containerGap?: string;
  fontSize?: string;
  onClick$?: QRL<() => Promise<void>>;
  class?: string;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "flex items-center justify-between rounded-3xl custom-border-2 p-3 w-72",
        props.class,
      )}
    >
      <div class="flex items-center gap-4">
        {props.image && <img src={props.image} width="24" height="24" />}
        <p class="font-normal">{props.text}</p>
      </div>
      <img
        src="../../../assets/icons/arrow-forward.svg"
        alt="Arrow Forward"
        width="16"
        height="16"
      />
    </button>
  );
});
