import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Input, type InputProps } from "./Input";

const meta: Meta<InputProps> = {
  component: Input,
};

type Story = StoryObj<InputProps>;

export default meta;

export const WalletName: Story = {
  render: () => (
    <Input text="wallet name" placeholder="Enter wallet name..."></Input>
  ),
};

export const WalletAddress: Story = {
  render: () => (
    <Input text="wallet address" placeholder="Enter wallet address..."></Input>
  ),
};
