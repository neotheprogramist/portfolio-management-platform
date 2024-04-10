import { Slot, component$ } from "@builder.io/qwik";
export interface HeroTextProps {
  title?: string;
  description?: string;
}

export const HeroText = component$<HeroTextProps>((props) => {
  return (
    <div class="grid justify-items-center gap-6 text-center">
      <Slot />
      <h1 class="text-4xl font-medium">{props.title}</h1>
      <p class="text-base font-normal">{props.description}</p>
    </div>
  );
});
