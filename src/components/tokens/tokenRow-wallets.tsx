import { component$ } from "@builder.io/qwik";
import ImgBtc from "/public/images/bitcoin-btc-logo.svg?jsx";
import ImgMore from "/public/images/svg/more.svg?jsx";

type TokenRowWalletsProps = {
  name: string;
  symbol: string;
  balance: string;
  balanceValueUSD: string;
};

export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({ name, symbol, balance, balanceValueUSD }) => {
    return (
      <>
        <tr class="text-sm">
          <td class="flex items-center gap-4 py-2">
            <div class="border-white-opacity-20 rounded-lg bg-white bg-opacity-10 p-2">
              <ImgBtc />
            </div>
            <p class="text-white">
              {name} <span class="text-white text-opacity-50">{symbol}</span>
            </p>
          </td>
          <td class="">
            <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white ">
              {balance}
            </span>
          </td>
          <td class="">
            <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
              ${balanceValueUSD}
            </span>
          </td>
          <td class="text-center">
            <span class="bg-glass rounded-lg border border-green-500 bg-green-500 px-2 py-1 text-green-500">
              0%
            </span>
          </td>
          <td class="text-right">
            <button class="border-white-opacity-20 bg-glassp rounded-lg p-1.5">
              <ImgMore />
            </button>
          </td>
        </tr>
      </>
    );
  },
);
