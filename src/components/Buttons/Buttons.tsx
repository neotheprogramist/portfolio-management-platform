import { type QRL, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  text?: string;
  image?: string;
  border?: string;
  class?: string;
  background?: string;
  width?: string;
  divClass?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
  onClick$?: QRL<() => Promise<void>>;
}

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge("h-12 cursor-pointer rounded-10 border-2", props.class)}
      disabled={props.disabled}
      type={props.type}
    >
      <div class={props.divClass}>{props.text}</div>
    </button>
  );
});

export const ButtonWithIcon = component$<ButtonProps>((props) => {
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "flex h-8 items-center justify-center gap-2 rounded-10 px-4 text-xs",
        props.class,
      )}
    >
      {props.image && <img src={props.image} width="16" height="16" />}
      <span>{props.text}</span>
    </button>
  );
});

export const ConnectButton = component$<ButtonProps>((props) => {
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
