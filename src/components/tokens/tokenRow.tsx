import { component$ } from "@builder.io/qwik";
import ImgBtc from "/public/images/bitcoin-btc-logo.svg?jsx";
import ImgStar from "/public/images/star.svg?jsx";
import ImgGraf from "/public/images/svg/graf.svg?jsx";

export const TokenRow = component$(() => {
  return (
    <div class="grid grid-cols-[17%_8%_13%_17%_14%_11%_12%_2%] items-center gap-[8px] custom-border-b-1 py-[16px] text-left text-[14px]">
      <div class="flex items-center gap-[16px] py-[8px]">
        <div class="rounded-[8px] custom-border-1 bg-white bg-opacity-10 p-2">
          <ImgBtc />
        </div>
        <p class="">
          Bitcoin <span class="custom-text-50">BTC</span>
        </p>
      </div>
      <div class="">
        <span class="custom-bg-white rounded-lg custom-border-1 px-2 py-1  ">
          481
        </span>
      </div>
      <div class="">
        <span class="custom-bg-white rounded-lg custom-border-1 px-2 py-1 ">
          $67,083.63
        </span>
      </div>
      <div class="flex gap-[16px]">
        <span class="custom-bg-white rounded-lg border border-green-500 bg-green-500 px-2 py-1 text-green-500">
          +3,36%
        </span>
        <ImgGraf />
      </div>
      <div class="">
        <span class="custom-bg-white rounded-lg custom-border-1 px-2 py-1 ">
          TreasuryBTC
        </span>
      </div>
      <div class="">
        <span class="custom-bg-white rounded-lg custom-border-1 px-2 py-1 ">
          Ethereum
        </span>
      </div>
      <div class="">
        <span class="custom-bg-white rounded-lg custom-border-1 px-2 py-1 ">
          Investment
        </span>
      </div>
      <div class="flex justify-end">
        <ImgStar />
      </div>
    </div>
  );
});
