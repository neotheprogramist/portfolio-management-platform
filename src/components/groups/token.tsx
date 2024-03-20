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
          <span class="custom-border-1 rounded-[8px] p-[8px] ">
            {props.network}
          </span>
        </div>
        <button class="rounded-[2px] bg-[#22222214] bg-opacity-[8]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="4"
            height="12"
            viewBox="0 0 4 12"
            fill="none"
            onClick$={props.onClick$}
          >
            <path
              d="M1.99984 11.3346C1.63317 11.3346 1.31928 11.2041 1.05817 10.943C0.797059 10.6819 0.666504 10.368 0.666504 10.0013C0.666504 9.63464 0.797059 9.32075 1.05817 9.05964C1.31928 8.79852 1.63317 8.66797 1.99984 8.66797C2.3665 8.66797 2.68039 8.79852 2.9415 9.05964C3.20262 9.32075 3.33317 9.63464 3.33317 10.0013C3.33317 10.368 3.20262 10.6819 2.9415 10.943C2.68039 11.2041 2.3665 11.3346 1.99984 11.3346ZM1.99984 7.33464C1.63317 7.33464 1.31928 7.20408 1.05817 6.94297C0.797059 6.68186 0.666504 6.36797 0.666504 6.0013C0.666504 5.63464 0.797059 5.32075 1.05817 5.05964C1.31928 4.79852 1.63317 4.66797 1.99984 4.66797C2.3665 4.66797 2.68039 4.79852 2.9415 5.05964C3.20262 5.32075 3.33317 5.63464 3.33317 6.0013C3.33317 6.36797 3.20262 6.68186 2.9415 6.94297C2.68039 7.20408 2.3665 7.33464 1.99984 7.33464ZM1.99984 3.33464C1.63317 3.33464 1.31928 3.20408 1.05817 2.94297C0.797059 2.68186 0.666504 2.36797 0.666504 2.0013C0.666504 1.63464 0.797059 1.32075 1.05817 1.05964C1.31928 0.798524 1.63317 0.667969 1.99984 0.667969C2.3665 0.667969 2.68039 0.798524 2.9415 1.05964C3.20262 1.32075 3.33317 1.63464 3.33317 2.0013C3.33317 2.36797 3.20262 2.68186 2.9415 2.94297C2.68039 3.20408 2.3665 3.33464 1.99984 3.33464Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
    </>
  );
});
