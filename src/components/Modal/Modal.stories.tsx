import type { Meta, StoryObj } from "storybook-framework-qwik";
import { Modal, type ModalProps } from "./Modal";
import { Select } from "../Select/Select";
import { Input } from "../Input/Input";
import { Button } from "../Buttons/Buttons";
import { type Signal } from "@builder.io/qwik";

const meta: Meta<ModalProps> = {
  component: Modal,
};

type Story = StoryObj<ModalProps>;

export default meta;

export const WalletsAdd: Story = {
  render: () => (
    <Modal title="Add Wallet" isOpen={true as unknown as Signal<boolean>}>
      <div class="mb-8 flex flex-col gap-4">
        <Select
          labelText="Type"
          text="Observable"
          onValueChange={() => {}}
          value="1"
        />
        <Select
          labelText="Network"
          text="Ethereum (Default)"
          onValueChange={() => {}}
          value="2"
        />
        <Input text="wallet name" placeholder="Enter wallet name..." />
        <Input text="wallet address" placeholder="Enter wallet address..." />
      </div>
      <Button class="w-full" text="Add Wallet" />
    </Modal>
  ),
};

export const WalletsAuthorization: Story = {
  render: () => (
    <Modal
      title="Wallet authorization"
      isOpen={true as unknown as Signal<boolean>}
    >
      <div class="mb-8 flex flex-col gap-4">
        <Select
          labelText="Type"
          text="Executable"
          onValueChange={() => {}}
          value="1"
        />
        <Select
          labelText="Network"
          text="Ethereum (Default)"
          onValueChange={() => {}}
          value="2"
        />
        <Input text="wallet name" placeholder="Enter wallet name..." />
        <div class="flex items-center justify-between">
          <span class="custom-text-50 text-xs uppercase">Wallet address</span>
          <Button class="h-8" text="Connect Wallet" />
        </div>
      </div>
      <Button class="w-full" text="Proceed" />
    </Modal>
  ),
};
