import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";

interface ObservedWalletProps {
  observedWallet: WalletTokensBalances;
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
}

export const ObservedWallet = component$<ObservedWalletProps>(
  ({ observedWallet, selectedWallet, chainIdToNetworkName }) => {
    return (
      <div
        class="m-2 cursor-pointer rounded bg-gray-200 p-2 shadow-md"
        onClick$={() => {
          selectedWallet.value = observedWallet;
        }}
      >
        <div class="text-lg font-bold">{observedWallet.wallet.name}</div>
        <div class="text-base text-gray-500">
          {chainIdToNetworkName[observedWallet.wallet.chainId]}
        </div>
      </div>
    );
  },
);
