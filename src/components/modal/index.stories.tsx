// import type { Meta, StoryObj } from "storybook-framework-qwik";
// import { Modal, type ModalProps } from "./index";
// import { Select } from "../select/select";
// import { Input } from "../input/input";
// import { Button } from "../blue-button/blue-button";

// const meta: Meta<ModalProps> = {
//   component: Modal,
// };

// type Story = StoryObj<ModalProps>;

// export default meta;

// export const WalletsAdd: Story = {
//   render: () => (
//     <Modal title="Add Wallet">
//       <div class="mb-8 flex flex-col gap-4">
//         <Select labelText="Type" text="Observable" />
//         <Select labelText="Network" text="Ethereum (Default)" />
//         <Input text="wallet name" placeholder="Enter wallet name..." />
//         <Input text="wallet address" placeholder="Enter wallet address..." />
//       </div>
//       <Button class="w-full" text="Add Wallet" />
//     </Modal>
//   ),
// };

// export const WalletsAuthorization: Story = {
//   render: () => (
//     <Modal title="Wallet authorization">
//       <div class="mb-8 flex flex-col gap-4">
//         <Select labelText="Type" text="Executable" />
//         <Select labelText="Network" text="Ethereum (Default)" />
//         <Input text="wallet name" placeholder="Enter wallet name..." />
//         <div class="flex items-center justify-between">
//           <span class="custom-text-50 text-xs uppercase">Wallet address</span>
//           <Button class="h-8" text="Connect Wallet" />
//         </div>
//       </div>
//       <Button class="w-full" text="Proceed" />
//     </Modal>
//   ),
// };
