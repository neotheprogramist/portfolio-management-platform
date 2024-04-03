import { component$ } from "@builder.io/qwik";
export interface TitleDescriptionProps {
  title?: string;
  description?: string;
  class?: string;
}

export const TitleDescription = component$<TitleDescriptionProps>((props) => {
  return (
    <div class="grid gap-6 text-center">
      <h1 class="text-4xl font-medium">{props.title}</h1>
      <p class="text-base font-normal">{props.description}</p>
    </div>
  );
});
