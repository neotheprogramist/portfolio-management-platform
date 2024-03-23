import { component$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import MenuDots from "/public/images/svg/portfolio/menuDots.svg?jsx";

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
        class="custom-border-1-b grid items-center text-nowrap py-[6px] text-[12px]"
        style="grid-template-columns: minmax(200px, 400px) repeat(2, minmax(100px, 200px)) minmax(180px, 300px) repeat(2, minmax(145px, 300px)) 40px;"
      >
        <div class="flex h-[40px] items-center gap-[6px]">
          <div class="custom-border-1 flex items-center justify-center rounded-[8px] p-[8px]">
            {props.icon && <img src={props.icon} width="20" height="20" />}
          </div>
          <div class="flex h-full items-center gap-[6px] overflow-x-auto">
            <p>{props.name}</p>
            <span class="custom-text-50">{props.symbol}</span>
          </div>
        </div>
        <div class="flex h-full items-center overflow-auto">
          <span class="custom-border-1 rounded-[8px] p-[8px]">
            {props.quantity}
          </span>
        </div>
        <div class="flex h-full items-center overflow-auto">
          <span class="custom-border-1 rounded-[8px] p-[8px]">
            {props.value}
          </span>
        </div>

        <div class="flex h-full items-center overflow-auto">
          <span class="rounded-[8px] p-[8px]"></span>
        </div>
        <div class="flex h-full items-center overflow-auto">
          <span class="custom-border-1 rounded-[8px] p-[8px]">
            {props.wallet}
          </span>
        </div>
        <div class="flex h-full items-center overflow-auto font-medium">
          <span class="custom-border-1 rounded-[8px] p-[8px]">
            {props.network}
          </span>
        </div>
        <button
          class="custom-border-1 custom-bg-white flex h-[28px] w-[28px] items-center justify-center rounded-[8px]"
          onClick$={props.onClick$}
        >
          <MenuDots />
        </button>
      </div>
    </>
  );
});
