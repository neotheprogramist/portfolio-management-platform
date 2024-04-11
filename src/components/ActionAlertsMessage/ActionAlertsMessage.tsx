import { Slot, component$ } from "@builder.io/qwik";

export interface ActionAlertMessageProps {
  title?: string;
  descrption?: string;
}

export const ActionAlertMessage = component$<ActionAlertMessageProps>(
  (props) => {
    return (
      <>
        <div class="custom-border-b-1 flex items-center justify-between py-5">
          <div class="">
            <h3 class="text-sm">{props.title}</h3>
            <p class="custom-text-50 text-xs">{props.descrption}</p>
          </div>
          <Slot />
        </div>
      </>
    );
  },
);
