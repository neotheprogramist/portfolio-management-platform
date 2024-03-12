import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import ImgDelete from "/public/images/svg/delete.svg?jsx";
import ImgIcon from "/public/images/svg/ethereum.svg?jsx";
import ImgWallet from "/public/images/svg/walletIcon.svg?jsx";
import { TokenRowWallets } from "~/components/tokens/tokenRow-wallets";

interface SelectedWalletProps {
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
  isDeleteModalopen: Signal<boolean>;
}

export const SelectedWalletDetails = component$<SelectedWalletProps>(
  ({ selectedWallet, chainIdToNetworkName, isDeleteModalopen }) => {
    if (!selectedWallet.value) return <></>;
    return (
      <div class="grid grid-rows-[64px_1fr] gap-4 overflow-auto text-white">
        <div class="row-span-1 row-start-1 flex w-full items-center justify-between rounded">
          <div class="">
            <h1 class="text-xl font-semibold">
              {selectedWallet.value.wallet.name}
            </h1>
            <div class="mt-2 flex gap-4">
              <span class="flex items-center gap-2 text-sm text-gray-500 ">
                <div class="rounded border border-white border-opacity-20 bg-white bg-opacity-5 px-2 py-1">
                  <ImgIcon />
                </div>
                {chainIdToNetworkName[selectedWallet.value.wallet.chainId]}
              </span>
              <span class="flex items-center gap-2 text-sm text-gray-500 ">
                <div class="rounded border border-white border-opacity-20 bg-white bg-opacity-5 p-1.5">
                  <ImgWallet />
                </div>
                {selectedWallet.value.wallet.address}
              </span>
            </div>
          </div>
          <button
            class="flex cursor-pointer gap-2 rounded-[40px] bg-red-500 bg-opacity-20 px-4 py-3 text-red-500  "
            onClick$={() => {
              isDeleteModalopen.value = !isDeleteModalopen.value;
            }}
          >
            <ImgDelete />
            Delete Wallet
          </button>
        </div>

        <div class="row-span-1 row-start-2 h-full overflow-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-white text-opacity-50">
                <td>TOKEN NAME</td>
                <td>QUANTITY</td>
                <td>VALUE</td>
                <td class="flex items-center justify-center gap-4">
                  CHANGE
                  <div class="bg-glass flex gap-1 rounded-lg border border-white border-opacity-20 p-1 text-white ">
                    <button class="color-gradient rounded-lg p-2">24h</button>
                    <button class="p-2">3d</button>
                    <button class="p-2">30d</button>
                  </div>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody class="overflow-auto">
              {selectedWallet.value.tokens.map((token: any) => {
                return (
                  <TokenRowWallets
                    key={token.id}
                    name={token.name}
                    symbol={token.symbol}
                    balance={token.balance}
                    balanceValueUSD={token.balanceValueUSD}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
