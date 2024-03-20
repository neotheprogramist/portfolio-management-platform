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
      <div class="grid grid-rows-[64px_24px_1fr] gap-[16px] overflow-auto text-white">
        <div class="row-span-1 row-start-1 flex w-full items-start justify-between rounded">
          <div class="">
            <h1 class="text-xl font-semibold">
              {selectedWallet.value.wallet.name}
            </h1>
            <div class="mt-2 flex gap-4">
              <span class="custom-text-50 flex items-center gap-2 text-sm">
                <div class="custom-border-1 flex h-[24px] w-[24px] items-center rounded-[4px] bg-white bg-opacity-5 px-[6px]">
                  <ImgIcon />
                </div>
                {chainIdToNetworkName[selectedWallet.value.wallet.chainId]}
              </span>
              <span class="custom-text-50 flex items-center gap-2 text-sm">
                <div class="custom-border-1 flex h-[24px] w-[24px] items-center rounded-[4px] bg-white bg-opacity-5 px-[3px]">
                  <ImgWallet />
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
            <ImgDelete />
            <p class="lg:hidden">Delete Wallet</p>
          </button>
        </div>

        <div class="row-span-1 row-start-2">
          <div class="custom-text-50 grid grid-cols-[25%_14%_15%_32%_9%] items-center gap-[8px] text-left text-xs uppercase">
            <div class="">Token name</div>
            <div class="">Quantity</div>
            <div class="">Value</div>
            <div class="flex justify-center">
              <div class="custom-bg-white custom-border-1 m-[0, auto] flex h-[32px] w-fit gap-[8px] rounded-[8px] p-[3.5px] text-white">
                <button class="custom-bg-button rounded-[8px] px-[8px]">
                  24h
                </button>
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
