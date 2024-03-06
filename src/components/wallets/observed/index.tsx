import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import ImgIcon from '/public/images/svg/ethereum.svg?jsx';
import ImgClock from '/public/images/svg/clock.svg?jsx';

interface ObservedWalletProps {
  observedWallet: WalletTokensBalances;
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
}

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, selectedWallet, chainIdToNetworkName }) => {
    return (
      <div
        class=" cursor-pointer flex items-center justify-between border-b border-white border-opacity-20 py-4"
        onClick$={() => {
          selectedWallet.value = observedWallet;
        }}
      >
        <div class="flex items-center gap-3">
          <div class="border border-white border-opacity-20 rounded py-1 px-2 bg-white bg-opacity-5">
            <ImgIcon/>
          </div>
          <div class="">
            <div class="text-sm">{observedWallet.wallet.name}</div>
            <div class="text-xs text-gray-500">
              {chainIdToNetworkName[observedWallet.wallet.chainId]}
            </div>
          </div>
        </div>
        <ImgClock/>
      </div>
    );
  },
);
