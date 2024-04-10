import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Modal, type ModalProps } from "./index";
import { Select } from "../select/select";
import { Input } from "../input/input";
import { Button } from "../blue-button/blue-button";

const meta: Meta<ModalProps> = {
  component: Modal,
};

type Story = StoryObj<ModalProps>;

export default meta;

export const WalletsAdd: Story = {
  render: () => (
    <Modal title="Add Wallet">
      <div class="flex flex-col gap-4">
        <Select labelText="Type" text="Executable"></Select>
        <Select labelText="Network" text="Ethereum (Default)"></Select>
        <Input text="wallet name" placeholder="Enter wallet name..."></Input>
        <Input
          text="wallet address"
          placeholder="Enter wallet address..."
        ></Input>
      </div>
      <Button class="w-full" text="Add Wallet"></Button>
    </Modal>
  ),
};

export const WalletsAuthorization: Story = {
  render: () => (
    <Modal title="Wallet authorization">
      <div class=""></div>
      <Button class="w-full" text="Proceed"></Button>
    </Modal>
  ),
};
