import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Gradient } from "./gradient";

const meta: Meta<Gradient> = {
  component: Gradient,
};

type Story = StoryObj<Gradient>;

export default meta;

export const Primary: Story = {
  render: (props) => <Gradient {...props}></Gradient>,
};
