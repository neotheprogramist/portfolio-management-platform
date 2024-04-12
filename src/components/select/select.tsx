import { component$, QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export type Option = {
  value: number | string;
  text: string;
};
export interface SelectProps {
  labelText?: string;
  text?: string;
  class?: string;
  options?: Option[];
  value: number | string;
  onValueChange: any;
}

export const Select = component$<SelectProps>((props) => {
  return (
    <div>
      <label class="custom-text-50 text-xs uppercase">{props.labelText}</label>
      <select
        onClick$={(e: any) => {
          const target = e.target as any;
          console.log("target.value: ", target.value);
          props.onValueChange(target.value); // Użyj funkcji przekazanej przez propsy do aktualizacji wartości
        }}
        value={props.value}
        class={twMerge(
          "custom-border-1 mt-2 h-12 w-full cursor-pointer rounded-lg bg-transparent px-4 text-white",
        )}
      >
        {props.options?.map((option, index) => (
          <option
            class="text-black"
            key={`${option.text}${index}`}
            value={option.value}
          >
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
});
