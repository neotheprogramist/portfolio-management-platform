import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Select, type SelectProps } from "./select";

const meta: Meta<SelectProps> = {
  component: Select,
};

type Story = StoryObj<SelectProps>;

export default meta;

export const WalletType: Story = {
  render: () => <Select labelText="Type" text="Executable"></Select>,
};

export const WalletNetwork: Story = {
  render: () => <Select labelText="Network" text="Ethereum (Default)"></Select>,
};
