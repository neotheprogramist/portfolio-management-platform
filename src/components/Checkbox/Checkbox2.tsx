import { type QRL, component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface CheckBoxProps {
  value: string | number;
  onClick: QRL<() => void>;
  checked: boolean;
  name: string;
  class?: string;
}

export const CheckBox = component$<CheckBoxProps>((props) => {
  return (
    <input
      id={props.name}
      name={props.name}
      type="checkbox"
      class={twMerge(
        "border-gradient custom-border-1 custom-bg-white checked checked:after:border-bg relative z-10 h-6 w-6 appearance-none rounded checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-2.5 checked:after:w-1.5 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:border-solid hover:cursor-pointer focus:after:absolute focus:after:z-[1]",
        props.class,
      )}
      value={props.value}
      onClick$={props.onClick}
      checked={props.checked}
    />
  );
});
