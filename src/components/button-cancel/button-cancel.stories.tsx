import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ButtonCancel, type ButtonProps } from "./button-cancel";

const meta: Meta<ButtonProps> = {
  component: ButtonCancel,
};

type Story = StoryObj<ButtonProps>;

export default meta;

export const Primary: Story = {
  render: (props) => <ButtonCancel {...props}>cancel</ButtonCancel>,
};

export const Highlighted: Story = {
  args: {
    isHighlighted: true,
  },
  render: (props) => <ButtonCancel {...props}>cancel</ButtonCancel>,
};
