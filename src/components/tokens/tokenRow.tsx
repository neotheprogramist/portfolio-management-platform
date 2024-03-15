import { component$ } from "@builder.io/qwik";
import ImgBtc from "/public/images/bitcoin-btc-logo.svg?jsx";
import ImgStar from "/public/images/star.svg?jsx";
import ImgGraf from "/public/images/svg/graf.svg?jsx";

export const TokenRow = component$(() => {
  return (
    <div class="grid grid-cols-[17%_8%_11%_20%_14%_11%_12%_3%] items-center gap-[8px] border-b border-white border-opacity-10 py-[16px] text-left text-[14px]">
      <div class="flex items-center gap-4 py-2">
        <div class="rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 p-2">
          <ImgBtc />
        </div>
        <p class="text-white">
          Bitcoin <span class="text-white text-opacity-50">BTC</span>
        </p>
      </div>
      <div class="">
        <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white ">
          481
        </span>
      </div>
      <div class="">
        <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
          $67,083.63
        </span>
      </div>
      <div class="flex justify-center gap-[16px]">
        <span class="bg-glass rounded-lg border border-green-500 bg-green-500 px-2 py-1 text-green-500">
          +3,36%
        </span>
        <ImgGraf />
      </div>
      <div class="">
        <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
          TreasuryBTC
        </span>
      </div>
      <div class="">
        <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
          Ethereum
        </span>
      </div>
      <div class="">
        <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
          Investment
        </span>
      </div>
      <div class="flex justify-end">
        <ImgStar />
      </div>
    </div>
  );
});
