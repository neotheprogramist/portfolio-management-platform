import type { Meta, StoryObj } from "storybook-framework-qwik";
import { CheckBox, type CheckBoxProps } from "./checkbox";

const meta: Meta<CheckBoxProps> = {
  component: CheckBox,
};

type Story = StoryObj<CheckBoxProps>;

export default meta;

export const checkbox: Story = {
  render: () => <CheckBox />,
};

export const input: Story = {
  render: () => <CheckBox />,
};
