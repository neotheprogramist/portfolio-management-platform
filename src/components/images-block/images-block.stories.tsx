import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ImagesBlock } from "./images-block";

const meta: Meta<ImagesBlock> = {
  component: ImagesBlock,
};

type Story = StoryObj<ImagesBlock>;

export default meta;

export const Primary: Story = {
  render: (props) => <ImagesBlock {...props}></ImagesBlock>,
};
