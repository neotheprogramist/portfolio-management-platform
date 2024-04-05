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

export interface ConnectButtonProps {
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

export const ConnectButton = component$<ConnectButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "custom-border-2 flex w-72 items-center justify-between rounded-3xl p-3 text-sm",
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


