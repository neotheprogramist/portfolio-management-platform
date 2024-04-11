import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface CheckBoxProps {
    // hasText: boolean;
}

export const CheckBox = component$<CheckBoxProps>(() => {
  return (
    <input
    type="checkbox"
    class="custom-bg-white custom-border-1 relative h-5 w-5 appearance-none rounded checked:after:absolute checked:after:ms-[0.35rem] checked:after:mt-0.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-[0.1rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent hover:cursor-pointer focus:after:absolute focus:after:z-[1]"
    />
  );
});
