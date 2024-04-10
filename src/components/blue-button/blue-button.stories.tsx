import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Button, type ButtonProps } from "./blue-button";

const meta: Meta<ButtonProps> = {
  component: Button,
};

type Story = StoryObj<ButtonProps>;

export default meta;

export const AddWalletButton: Story = {
  render: () => <Button text="Add Wallet"></Button>,
};
