import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ConnectButton, type ConnectButtonProps } from "./Buttons";

const meta: Meta<ConnectButtonProps> = {
  component: ConnectButton,
};

type Story = StoryObj<ConnectButtonProps>;

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
      padding="8px 12px 8px 8px"
      buttonWidth="200px"
      borderColor="#2196F3"
      containerGap="8px"
      fontSize="12px"
    ></ConnectButton>
  ),
};
