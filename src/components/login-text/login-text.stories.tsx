import type { Meta, StoryObj } from "storybook-framework-qwik";
import { LoginText } from "./login-text";

const meta: Meta = {
  component: LoginText,
};

type Story = StoryObj;

export default meta;

export const Primary: Story = {
  render: (props) => <LoginText {...props}></LoginText>,
};
