import type { Meta, StoryObj } from "storybook-framework-qwik";
import { WelcomeText } from "./welcome-text";

const meta: Meta<WelcomeText> = {
  component: WelcomeText,
};

type Story = StoryObj<WelcomeText>;

export default meta;

export const Primary: Story = {
  render: (props) => <WelcomeText {...props}></WelcomeText>,
};
