import { component$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import IconDelete from "/public/assets/icons/delete-white.svg?jsx";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import { ButtonWithIcon } from "../Buttons/Buttons";

export interface TokenRowProps {
  icon?: string;
  name?: string;
  symbol?: string;
  quantity?: string;
  value?: string;
  wallet?: string;
  network?: string;
  onClick$?: QRL<() => void>;
}
export const TokenRow = component$<TokenRowProps>((props) => {
  return (
    <>
      <div class="custom-border-b-1 grid grid-cols-[18%_13%_15%_18%_10%_10%_13%_6%] items-center text-nowrap py-4 text-sm">
        <div class="flex h-10 items-center gap-1">
          <div class="custom-border-1 flex items-center justify-center rounded-lg p-2">
            {props.icon && <img src={props.icon} width="20" height="20" />}
          </div>
          <div class="flex h-full items-center gap-1 overflow-x-auto">
            <p>{props.name}</p>
            <span class="custom-text-50">{props.symbol}</span>
          </div>
        </div>
        <div class="flex h-full items-center overflow-auto">
          {props.quantity}
        </div>
        <div class="flex h-full items-center overflow-auto">{props.value}</div>

        <div class="flex h-full items-center justify-center gap-4">
          <span class="text-customGreen">3,6%</span>
          <IconGraph />
        </div>
        <div class="flex h-full items-center overflow-auto">{props.wallet}</div>
        <div class="flex h-full items-center overflow-auto font-medium">
          {props.network}
        </div>
        <div class="flex h-full items-center overflow-auto font-medium">
          <ButtonWithIcon
            text="Swap Token"
            image="/public/assets/icons/portfolio/swap.svg?jsx"
            class="custom-border-1 py-2 text-sm "
          />
        </div>
        <button
          class="flex h-7 w-7 items-center justify-center rounded-lg"
          onClick$={props.onClick$}
        >
          <IconDelete />
        </button>
      </div>
    </>
  );
});
