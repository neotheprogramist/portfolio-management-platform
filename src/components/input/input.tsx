import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface InputProps {
  text?: string;
  placeholder?: string;
}

export const Input = component$<InputProps>((props) => {
  return (
    <div>
      <label class="custom-text-50 text-xs uppercase">{props.text}</label>
      <input
        type="text"
        class={twMerge(
          "custom-border-1 mt-2 h-12 w-full cursor-pointer rounded-lg bg-transparent px-4 text-white placeholder:text-white",
        )}
        placeholder={props.placeholder}
      />
    </div>
  );
});
