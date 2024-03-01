import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ButtonAccept, type ButtonProps } from "./button-accept";

const meta: Meta<ButtonProps> = {
  component: ButtonAccept,
};

type Story = StoryObj<ButtonProps>;

export default meta;

export const Primary: Story = {
  render: (props) => <ButtonAccept {...props}>Accept and Sign</ButtonAccept>,
};

export const Highlighted: Story = {
  args: {
    isHighlighted: true,
  },
  render: (props) => <ButtonAccept {...props}>Accept and Sign</ButtonAccept>,
};
