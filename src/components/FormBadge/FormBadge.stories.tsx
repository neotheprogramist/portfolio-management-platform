import type { Meta, StoryObj } from "storybook-framework-qwik";
import { FormBadge, type FormBadgeProps } from "./FormBadge";
import { CheckBox } from "../checkbox/checkbox";
import { Input } from "../input/input";
import { $ } from "@builder.io/qwik";

const meta: Meta<FormBadgeProps> = {
  component: FormBadge,
};

type Story = StoryObj<FormBadgeProps>;

export default meta;

export const WithCheckbox: Story = {
  render: () => (
    <FormBadge
      input={<CheckBox value="1" checked={false} name="name" onClick={$(()=>{})} />}
      image="/assets/icons/tokens/btc.svg"
      text="Bitcoin"
      description="BTC"
    />
  ),
};

export const WithInput: Story = {
  render: () => (
    <FormBadge
      input={
        <Input
          labelClass="mb-0"
          customClass="p-2 z-10 h-9 w-56 appearance-none rounded bg-transparent placeholder:text-white placeholder:text-stone-200 mt-0"
          placeholder="Approval limit..."
        />
      }
      image="/assets/icons/tokens/btc.svg"
      text="Bitcoin"
      description="BTC"
    />
  ),
};
