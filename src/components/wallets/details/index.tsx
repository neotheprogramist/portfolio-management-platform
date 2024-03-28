import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconDelete from "/public/assets/icons/wallets/delete.svg?jsx";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconWallet from "/public/assets/icons/wallets/wallet.svg?jsx";
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
      <div class="grid grid-rows-[64px_24px_1fr] gap-[16px] overflow-auto text-white">
        <div class="row-span-1 row-start-1 flex w-full items-start justify-between rounded">
          <div class="">
            <h1 class="text-xl font-semibold">
              {selectedWallet.value.wallet.name}
            </h1>
            <div class="mt-2 flex gap-4">
              <span class="flex items-center gap-2 text-sm text-gray-500 ">
                <div class="border-white-opacity-20 flex h-[24px] w-[24px] items-center rounded-[4px] bg-white bg-opacity-5 px-[6px]">
                  <IconEthereum />
                </div>
                {chainIdToNetworkName[selectedWallet.value.wallet.chainId]}
              </span>
              <span class="flex items-center gap-2 text-sm text-gray-500 ">
                <div class="border-white-opacity-20 flex h-[24px] w-[24px] items-center rounded-[4px] bg-white bg-opacity-5 px-[3px]">
                  <IconWallet />
                </div>
                {selectedWallet.value.wallet.address}
              </span>
            </div>
          </div>
          <button
            class="mr-[4px] mt-[4px] flex h-[32px] cursor-pointer items-center gap-[8px] rounded-[40px] bg-red-500 bg-opacity-20 px-[16px] text-xs text-red-500 duration-300 ease-in-out hover:scale-105"
            onClick$={() => {
              isDeleteModalopen.value = !isDeleteModalopen.value;
            }}
          >
            <IconDelete />
            <p class="lg:hidden">Delete Wallet</p>
          </button>
        </div>

        <div class="row-span-1 row-start-2">
          <div class="grid grid-cols-[30%_14%_14%_32%_10%] items-center gap-[8px] text-left text-xs uppercase text-white text-opacity-50">
            <div class="">Token name</div>
            <div class="">Quantity</div>
            <div class="">Value</div>
            <div class="flex items-center justify-center gap-[16px]">
              <h2 class="uppercase text-gray-500">Change</h2>
              <div class="bg-glass border-white-opacity-20 flex h-[32px] gap-[8px] rounded-lg p-[2px] text-white">
                <button class="color-gradient rounded-lg px-[8px]">24h</button>
                <button class="px-[8px]">3d</button>
                <button class="px-[8px]">30d</button>
              </div>
            </div>
            <div class=""></div>
          </div>
        </div>

        <div class="row-span-1 row-start-3 h-full overflow-auto">
          <table class="w-full text-left">
            <tbody class="overflow-auto">
              {selectedWallet.value.tokens.map((token: any) => {
                console.log("token.imagePath", token.imagePath);
                return (
                  <TokenRowWallets
                    key={token.id}
                    name={token.name}
                    symbol={token.symbol}
                    balance={token.balance}
                    imagePath={token.imagePath}
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
