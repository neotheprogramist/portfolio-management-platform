import { component$ } from "@builder.io/qwik";
import ImgBtc from "/public/images/bitcoin-btc-logo.svg?jsx";
import ImgStar from "/public/images/star.svg?jsx";

export const TokenRow = component$(() => {
  return (
    <>
      <tr class="text-sm">
        <td class="flex items-center gap-4 py-2">
          <div class="rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 p-2">
            <ImgBtc />
          </div>
          <p class="text-white">
            Bitcoin <span class="text-white text-opacity-50">BTC</span>
          </p>
        </td>
        <td class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white ">
            481
          </span>
        </td>
        <td class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            $67,083.63
          </span>
        </td>
        <td class="text-center">
          <span class="bg-glass rounded-lg border border-green-500 bg-green-500 px-2 py-1 text-green-500">
            +3,36%
          </span>
        </td>
        <td class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            TreasuryBTC
          </span>
        </td>
        <td class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            Ethereum
          </span>
        </td>
        <td class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            Investment
          </span>
        </td>
        <td>
          <ImgStar />
        </td>
      </tr>
    </>
  );
});
