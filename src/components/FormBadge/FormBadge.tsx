import { type JSXOutput, component$ } from "@builder.io/qwik";

export interface FormBadgeProps {
  hasText?: boolean;
  text?: string;
  description?: string;
  image?: string;
  placeholder?: string;
  input?: JSXOutput | null;
  class?: string;
}

export const FormBadge = component$<FormBadgeProps>((props) => {
  return (
    <div class={props.class}>
      <div class="flex">
        <label
          for="checkBox"
          class="custom-bg-white custom-border-1 inline-flex w-full cursor-pointer  items-center justify-between rounded-lg p-2 pr-4"
        >
          <span class="flex items-center gap-2">
            <div class="custom-border-1 mr-2 rounded-lg p-2">
              {props.image && <img src={props.image} width="24" height="24" />}
            </div>
            <div class="">
              <p>{props.text}</p>
              <p class="custom-text-50 text-xs">{props.description}</p>
            </div>
          </span>
          <div class="max-w-fit">{props.input ? props.input : null}</div>
        </label>
      </div>
    </div>
  );
});
