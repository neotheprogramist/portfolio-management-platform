import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface SelectProps {
  labelText?: string;
  text?: string;
  class?: string;
}

export const Select = component$<SelectProps>((props) => {
  return (
    <div>
      <label class="custom-text-50 text-xs uppercase">{props.labelText}</label>
      <select
        class={twMerge(
          "custom-border-1 mt-2 h-12 w-full cursor-pointer rounded-lg bg-transparent px-4 text-white",
        )}
      >
        <option>{props.text}</option>
      </select>
    </div>
  );
});
