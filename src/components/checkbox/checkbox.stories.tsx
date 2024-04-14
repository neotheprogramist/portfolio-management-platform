import type { Meta, StoryObj } from "storybook-framework-qwik";
import { CheckBox, type CheckBoxProps } from "./checkbox";
import { $ } from "@builder.io/qwik";

const meta: Meta<CheckBoxProps> = {
  component: CheckBox,
};

type Story = StoryObj<CheckBoxProps>;

export default meta;

export const checkbox: Story = {
  render: () => <CheckBox
  onClick={$(() => {})}
  name='name'
  value='1'
  checked={false}
  />,
};


// <input
//   class="ml-2"
//   id={symbol}
//   name={symbol}
//   type="checkbox"
//   checked={addWalletFormStore.coinsToCount.includes(symbol)}
//   value={symbol}
//   onClick$={() => {
//     console.log("coins: ", addWalletFormStore.coinsToCount);
//     if (!addWalletFormStore.coinsToCount.includes(symbol)) {
//       addWalletFormStore.coinsToCount.push(symbol);
//     } else {
//       const indexToRemove =
//         addWalletFormStore.coinsToCount.indexOf(symbol);

//       if (indexToRemove !== -1) {
//         addWalletFormStore.coinsToCount.splice(indexToRemove, 1);
//       }
//     }
//   }}
// />
