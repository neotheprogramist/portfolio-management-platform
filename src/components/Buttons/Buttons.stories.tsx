import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ConnectButton, type ButtonProps } from "./Buttons";

const meta: Meta<ButtonProps> = {
  component: ConnectButton,
};

type Story = StoryObj<ButtonProps>;

export default meta;

export const WalletConnect: Story = {
  render: (props) => (
    <ConnectButton
      {...props}
      image="/assets/icons/login/walletconnect.svg"
      text="Use WalletConnect"
    ></ConnectButton>
  ),
};

export const Metamask: Story = {
  render: () => (
    <ConnectButton
      image="/assets/icons/login/metamask.svg"
      text="Use Metamask"
    ></ConnectButton>
  ),
};

export const Info: Story = {
  render: () => (
    <ConnectButton
      image="/assets/icons/info-white.svg"
      text="How to use Wallet?"
      class="w-52 !border-0 bg-customBlue py-2 pl-2 pr-3 text-xs"
    />
  ),
};
