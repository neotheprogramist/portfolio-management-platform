import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import Bitcoin from "/public/images/svg/portfolio/btc.svg?jsx";
import MenuDots from "/public/images/svg/portfolio/menuDots.svg?jsx";

export interface TokenProps {
  icon?: string;
  name?: string;
  symbol?: string;
  quantity?: string;
  value?: string;
  wallet?: string;
  network?: string;
}

export const Token = component$<TokenProps>((props) => {
  return (
    <>
      <div
        class="grid max-h-[56px] items-center gap-[8px] text-nowrap px-[20px]"
        style="grid-template-columns: minmax(200px, 400px) minmax(100px, 200px) repeat(4, minmax(145px, 300px)) 16px;"
      >
        <div class="flex h-[40px] items-center gap-[6px]">
          <div class="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full border border-[#E6E6E6]">
            {props.icon && <img src={props.icon} width="20" height="20" />}
          </div>
          <div class="flex h-full items-center gap-[6px] overflow-x-auto">
            <p>{props.name}</p>
            <span class="text-[10px] text-[#222222] text-opacity-[50%]">
              {props.symbol}
            </span>
          </div>
        </div>
        <p class="flex h-full items-center overflow-x-auto">{props.quantity}</p>
        <p class="font-mediumh-full flex items-center overflow-x-auto">
          {props.value}
        </p>
        <p class="flex h-full items-center overflow-x-auto"></p>
        <p class="flex h-full items-center overflow-x-auto">{props.wallet}</p>
        <p class="flex h-full items-center overflow-x-auto underline underline-offset-2">
          {props.network}
        </p>
        <button class="rounded-[2px] bg-[#22222214] bg-opacity-[8]">
          <MenuDots />
        </button>
      </div>
    </>
  );
});
