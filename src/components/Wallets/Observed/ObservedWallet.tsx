import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import IconEthereum from "/public/assets/icons/ethereum.svg?jsx";
import IconClock from "/public/assets/icons/wallets/clock.svg?jsx";

interface ObservedWalletProps {
  observedWallet: WalletTokensBalances;
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
}

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, selectedWallet, chainIdToNetworkName }) => {
    return (
      <div
        class="flex h-14 cursor-pointer items-center justify-between rounded-lg"
        onClick$={() => {
          selectedWallet.value = observedWallet;
        }}
      >
        <div class="flex items-center gap-3">
          <div class="custom-border-1 flex h-6 w-6 items-center justify-center rounded bg-white bg-opacity-5">
            <IconEthereum />
          </div>
          <div class="">
            <div class="text-sm">{observedWallet.wallet.name}</div>
            <div class="custom-text-50 text-xs">
              {chainIdToNetworkName[observedWallet.wallet.chainId]}
            </div>
          </div>
        </div>
        <IconClock />
      </div>
    );
  },
);
