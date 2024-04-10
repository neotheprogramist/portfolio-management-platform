import type { Meta, StoryObj } from "storybook-framework-qwik";
import { HeroText, type HeroTextProps } from "./HeroText";
import IconLogo from "/public/assets/icons/logo.svg?jsx";
import IconHandshake from "/public/assets/icons/signin/handshake.svg?jsx";
import IconError from "/public/assets/icons/error.svg?jsx";

const meta: Meta<HeroTextProps> = {
  component: HeroText,
};

type Story = StoryObj<HeroTextProps>;

export default meta;

export const LoginPage: Story = {
  render: (props) => (
    <HeroText
      {...props}
      title="Login to Emeth"
      description="Log in to the app using your Crypto Wallet"
    >
      <IconLogo class="h-6 w-28" />
    </HeroText>
  ),
};

export const SigninPage: Story = {
  render: (props) => (
    <HeroText
      {...props}
      title="Welcome to Emeth"
      description="By connecting your wallet and using Emeth, you agree to our Terms of Service and Privacy Policy."
    >
      <IconHandshake />
    </HeroText>
  ),
};

export const Error: Story = {
  render: (props) => (
    <HeroText
      {...props}
      title="Error Connecting"
      description="The connection attempt failed. Please click try again and follow the steps to connect in your wallet."
    >
      <IconError />
    </HeroText>
  ),
};
