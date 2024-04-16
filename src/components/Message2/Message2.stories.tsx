import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Message, type MessageProps } from "./Message2";

const meta: Meta<MessageProps> = {
  component: Message,
};

type Story = StoryObj<MessageProps>;

export default meta;

export const MessageDefault: Story = {
  render: (props) => (
    <Message {...props} message="We are trying to send your money..." />
  ),
};
export const MessageSuccess: Story = {
  render: (props) => (
    <Message {...props} variant="success" message="Money successfully sent" />
  ),
};
export const MessageError: Story = {
  render: (props) => (
    <Message
      {...props}
      variant="error"
      message="There was an error while sending your money."
    />
  ),
};
