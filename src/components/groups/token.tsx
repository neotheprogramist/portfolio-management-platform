import { component$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";

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
        class="grid items-center text-nowrap border-b-[1px] border-white border-opacity-10 pb-[12.5px] text-[12px]"
        style="grid-template-columns: minmax(200px, 400px) minmax(100px, 200px) repeat(4, minmax(145px, 300px)) 40px;"
      >
        <div class="flex h-[40px] items-center gap-[6px]">
          <div class="custom-border-1 flex items-center justify-center rounded-[8px] p-[8px]">
            {props.icon && <img src={props.icon} width="20" height="20" />}
          </div>
          <div class="flex h-full items-center gap-[6px] overflow-x-auto">
            <p>{props.name}Hello</p>
            <span class="text-[12px] text-white text-opacity-[50%]">
              {props.symbol}
            </span>
          </div>
        </div>
        <div class="flex h-full items-center overflow-auto font-medium">
          <span class="custom-border-1 rounded-[8px] p-[8px]">
            {props.quantity}
          </span>
        </div>
        <div class="flex h-full items-center overflow-auto font-medium">
          <span class="custom-border-1 rounded-[8px] p-[8px]">
            {props.value}
          </span>
        </div>

        <div class="flex h-full items-center overflow-auto font-medium">
          <span class="rounded-[8px] p-[8px]"></span>
        </div>
        <div class="flex h-full items-center overflow-auto font-medium">
          <span class="custom-border-1 rounded-[8px] p-[8px]">
            {props.wallet}
          </span>
        </div>
        <div class="font-medium overflow-auto h-full flex items-center">
          <span class="p-[8px] rounded-[8px] custom-border-1 ">
          {props.network}
        </p>
        <button class="rounded-[2px] bg-[#22222214] bg-opacity-[8]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick$={props.onClick$}
          >
            <rect
              width="20"
              height="20"
              rx="2"
              fill="#222222"
              fill-opacity="0.08"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10 7C10.5523 7 11 6.55228 11 6C11 5.44772 10.5523 5 10 5C9.44772 5 9 5.44772 9 6C9 6.55228 9.44772 7 10 7ZM10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14Z"
              fill="#222222"
            />
          </svg>
        </button>
      </div>
    </>
  );
});
