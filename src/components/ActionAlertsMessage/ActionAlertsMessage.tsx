import { Slot, component$ } from "@builder.io/qwik";

export interface ActionAlertMessageProps {
  title?: string;
  description?: string;
}

export const ActionAlertMessage = component$<ActionAlertMessageProps>(
  (props) => {
    return (
      <>
        <div class="custom-border-b-1 flex items-center justify-between py-5">
          <div class="">
            <h3 class="text-sm">{props.title}</h3>
            <p class="custom-text-50 text-xs">{props.description}</p>
          </div>
          <Slot />
        </div>
      </>
    );
  },
);
