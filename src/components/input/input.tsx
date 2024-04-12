import { component$, type QRL } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";

export interface InputProps {
  text?: string;
  placeholder?: string;
  name?: string;
  type?: string;
  value?: string;
  onInput?: QRL<(value: any) => void>;
  customClass?: string;
  disabled?: boolean;
}

export const Input = component$<InputProps>(
  ({
    text,
    placeholder,
    name,
    type,
    value,
    onInput,
    customClass,
    disabled,
  }) => {
    return (
      <div class="mb-4">
        <label class="custom-text-50 text-xs uppercase">{text}</label>
        <input
          class={twMerge(
            "custom-border-1 mt-2 h-12 w-full cursor-pointer rounded-lg bg-transparent px-4 text-white placeholder:text-white",
            customClass,
          )}
          placeholder={placeholder}
          name={name}
          type={type}
          value={value}
          onInput$={onInput}
          disabled={disabled}
        />
      </div>
    );
  },
);
