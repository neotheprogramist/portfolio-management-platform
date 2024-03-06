import { component$ } from "@builder.io/qwik";
import ImgBtc from "/public/images/bitcoin-btc-logo.svg?jsx";
import ImgMore from "/public/images/svg/more.svg?jsx";

export const TokenRowWallets = component$(() => {
  return (
    <>
      <tr class="text-sm">
        <td class="flex items-center gap-4 py-2">
          <div class="rounded-lg border-white-opacity-20 bg-white bg-opacity-10 p-2">
            <ImgBtc />
          </div>
          <p class="text-white">
            Bitcoin <span class="text-white text-opacity-50">BTC</span>
          </p>
        </td>
        <td class="">
          <span class="rounded-lg border border-white border-opacity-20 bg-glass px-2 py-1 text-white ">
            481
          </span>
        </td>
        <td class="">
          <span class="rounded-lg border border-white border-opacity-20 bg-glass px-2 py-1 text-white">
            $67,083.63
          </span>
        </td>
        <td class="text-center">
          <span class="rounded-lg border border-green-500 bg-green-500 bg-glass px-2 py-1 text-green-500">
            +3,36%
          </span>
        </td>
        <td class="text-right">
          <button class="rounded-lg border-white-opacity-20 bg-glassp p-1.5">
            <ImgMore />
          </button>
        </td>
      </tr>
    </>
  );
});
