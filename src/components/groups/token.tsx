import { component$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import IconDelete from "/public/assets/icons/delete-white.svg?jsx";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import IconSwap from "/public/assets/icons/portfolio/swap.svg?jsx";

export interface TokenProps {
  icon?: string;
  name?: string;
  symbol?: string;
  quantity?: string;
  value?: string;
  wallet?: string;
  network?: string;
  onClick$?: QRL<() => void>;
}
export const Token = component$<TokenProps>((props) => {
  return (
    <>
      <div
        class="custom-border-b-1 grid-cols-[18%_13%_15%_18%_10%_10%_13%_6%] grid items-center text-nowrap py-4 text-sm"
      >
        <div class="flex h-10 items-center gap-1">
          <div class="custom-border-1 flex items-center justify-center rounded-2 p-2">
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

        <div class="flex h-full items-center gap-4">
          <span class="text-customGreen">3,6%</span>
          <IconGraph />
        </div>
        <div class="flex h-full items-center overflow-auto">{props.wallet}</div>
        <div class="flex h-full items-center overflow-auto font-medium">
          {props.network}
        </div>
        <div class="flex h-full items-center overflow-auto font-medium">
          <button class="custom-border-1 flex gap-2 rounded-3xl px-4 py-2">
            <IconSwap />
            <span>Swap Token</span>
          </button>
        </div>
        <button
          class="flex h-7 w-7 items-center justify-center rounded-2"
          onClick$={props.onClick$}
        >
          <IconDelete />
        </button>
      </div>
    </>
  );
});
