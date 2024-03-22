import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import ImgIcon from "/public/images/svg/ethereum.svg?jsx";
import ImgClock from "/public/images/svg/clock.svg?jsx";

interface ObservedWalletProps {
  observedWallet: WalletTokensBalances;
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
}

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, selectedWallet, chainIdToNetworkName }) => {
    return (
      <div
        class="custom-border-b-1 flex h-[48px] cursor-pointer items-center justify-between pb-[20px] "
        onClick$={() => {
          selectedWallet.value = observedWallet;
        }}
      >
        <div class="flex items-center gap-[12px]">
          <div class="custom-border-1 flex h-[24px] w-[24px] items-center rounded-[4px] bg-white bg-opacity-5 px-[6px]">
            <ImgIcon />
          </div>
          <div class="">
            <div class="text-sm">{observedWallet.wallet.name}</div>
            <div class="custom-text-50 text-xs">
              {chainIdToNetworkName[observedWallet.wallet.chainId]}
            </div>
          </div>
        </div>
        <ImgClock />
      </div>
    );
  },
);
