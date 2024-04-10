import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ConnectWalletError } from "./ConnectWalletError";

const meta: Meta = {
  component: ConnectWalletError,
};

type Story = StoryObj;

export default meta;

export const ConnectError: Story = {
  render: () => <ConnectWalletError />,
};
