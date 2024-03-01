import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Paragraph } from "./paragraph";

const meta: Meta<Paragraph> = {
  component: Paragraph,
};

type Story = StoryObj<Paragraph>;

export default meta;

export const Primary: Story = {
  render: (props) => <Paragraph {...props}></Paragraph>,
};
