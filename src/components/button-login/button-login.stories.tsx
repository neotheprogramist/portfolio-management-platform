import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Button, type ButtonProps } from "./button-login";

const meta: Meta<ButtonProps> = {
  component: Button,
};

type Story = StoryObj<ButtonProps>;

export default meta;

export const WalletConnect: Story = {
  render: (props) => (
    <Button
      {...props}
      image="/images/svg/walletconnect-icon.svg"
      text="Use WalletConnect"
      dataTest="use-walletconnect"
    ></Button>
  ),
};

export const Metamask: Story = {
  render: () => (
    <Button
      image="/images/svg/metamask-icon.svg"
      text="Use Metamask"
      dataTest="use-metamask"
    ></Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button
      image="/images/svg/info.svg"
      text="How to use Wallet?"
      padding="8px 12px 8px 8px"
      buttonWidth="200px"
      borderColor="#2196F3"
      containerGap="8px"
      fontSize="12px"
      dataTest="how-to-use-wallet"
    ></Button>
  ),
};
