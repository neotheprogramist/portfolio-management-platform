import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconDelete from "/public/assets/icons/wallets/delete-red.svg?jsx";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconWallet from "/public/assets/icons/wallets/wallet.svg?jsx";
import IconLoading from "/public/assets/icons/wallets/loading.svg?jsx";
import { TokenRowWallets } from "~/components/tokens/tokenRow-wallets";
import { type transferredCoinInterface } from "~/routes/app/wallets";

interface SelectedWalletProps {
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
  isDeleteModalopen: Signal<boolean>;
  isTransferModalOpen: Signal<boolean>;
  transferredCoin: transferredCoinInterface;
}

export const SelectedWalletDetails = component$<SelectedWalletProps>(
  ({
    selectedWallet,
    chainIdToNetworkName,
    isDeleteModalopen,
    isTransferModalOpen,
    transferredCoin,
  }) => {
    if (!selectedWallet.value) return <></>;
    return (
      <div class="grid grid-rows-[64px_1fr] gap-6">
        <div class="flex justify-between">
          <div class="">
            <h1 class="text-xl font-semibold">
              {selectedWallet.value.wallet.name}
            </h1>
            <div class="mt-4 flex gap-2">
              <span class="custom-btn-gradient flex h-7 items-center rounded-lg px-[1px] text-xs ">
                <div class="flex h-[26px] items-center rounded-lg bg-black px-3">
                  Executable
                </div>
              </span>
              <span class="custom-text-50 custom-border-1 flex items-center gap-2 rounded-lg px-2 text-xs">
                <IconWallet />
                {/* {selectedWallet.value.wallet.address} */}
                0x5B...83db
              </span>
              <span class="custom-text-50 custom-border-1 flex items-center gap-2 rounded-lg px-2 text-xs">
                <IconEthereum />
                {chainIdToNetworkName[selectedWallet.value.wallet.chainId]}
              </span>
              <span class="flex items-center gap-2 text-nowrap rounded-lg border border-customBlue px-2 text-xs text-customBlue">
                <IconLoading />
                Loading Tokens 5/10
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="custom-border-2 h-8 cursor-pointer rounded-10 px-4 text-xs duration-300 ease-in-out hover:scale-105">
              Edit
            </button>
            <button class="custom-border-2 h-8 cursor-pointer rounded-10 px-4 text-xs duration-300 ease-in-out hover:scale-105">
              Deactivate
            </button>
            <button
              class="flex h-8 cursor-pointer items-center gap-2 rounded-10 bg-red-500 bg-opacity-20 px-4 text-xs text-red-500 duration-300 ease-in-out hover:scale-105"
              onClick$={() => {
                isDeleteModalopen.value = !isDeleteModalopen.value;
              }}
            >
              <IconDelete />
              <p class="lg:hidden">Delete Wallet</p>
            </button>
          </div>
        </div>
        <div class="grid gap-4">
          <div class="custom-text-50 grid grid-cols-[22%_12%_15%_22%_20%_4%] items-center gap-2 text-left text-xs uppercase">
            <div class="">Token name</div>
            <div class="">Quantity</div>
            <div class="">Value</div>
            {/* <div class="">Allowance</div> */}
            <div class="custom-border-1 flex h-8 w-fit gap-2 rounded-lg bg-white bg-opacity-5 p-1 text-white">
              <button class="custom-bg-button rounded-lg px-2">24h</button>
              <button class="rounded-lg px-2">3d</button>
              <button class="rounded-lg px-2">30d</button>
            </div>
            <div class="">Authorization</div>
            <div></div>
          </div>
          <div>
            {selectedWallet.value.tokens.map((token: any) => {
              return (
                <TokenRowWallets
                  key={token.id}
                  allowance={token.allowance}
                  address={token.address}
                  name={token.name}
                  symbol={token.symbol}
                  balance={token.balance}
                  imagePath={token.imagePath}
                  balanceValueUSD={token.balanceValueUSD}
                  isTransferModalOpen={isTransferModalOpen}
                  transferredCoin={transferredCoin}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);
