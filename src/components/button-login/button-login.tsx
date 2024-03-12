import { component$, type QRL } from "@builder.io/qwik";
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
  dataTest?: string;
}

export const Button = component$<ButtonProps>((props) => {
  const buttonStyle = {
    background:
      "linear-gradient(98deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)",
    borderColor: props.borderColor || "rgba(255, 255, 255, 0.2)",
    padding: props.padding || "12px 16px 12px 12px",
    width: props.buttonWidth || "284px",
    fontSize: props.fontSize || "14px",
  };
  const containerStyle = {
    gap: props.containerGap || "16px",
  };
  return (
    <button
      onClick$={props.onClick$}
      class={twMerge(
        "flex items-center justify-between rounded-3xl border-2",
        props.class,
      )}
      style={buttonStyle}
      data-test={props.dataTest ? `${props.dataTest}-button` : undefined}
    >
      <div class="flex items-center" style={containerStyle}>
        {props.image && <img src={props.image} width="24" height="24" />}
        <p class="font-normal">{props.text}</p>
      </div>
      <img
        src="../../../images/svg/arrow-forward.svg"
        alt="Arrow Forward"
        width="16"
        height="16"
      />
    </button>
  );
});
