import { type Signal, component$ } from "@builder.io/qwik";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { formatNativeBalance } from "~/utils/formatBalances/formatNativeBalance";

interface SelectedWalletProps {
  selectedWallet: Signal<WalletTokensBalances | null>;
  chainIdToNetworkName: { [key: string]: string };
  isDeleteModalopen: Signal<boolean>;
}

export const SelectedWalletDetails = component$<SelectedWalletProps>(
  ({ selectedWallet, chainIdToNetworkName, isDeleteModalopen }) => {
    if (!selectedWallet.value) return <></>;
    const formattedNativeBalance = formatNativeBalance(
      selectedWallet.value.wallet.nativeBalance,
    );
    return (
      <div class="text-white">
        <div class="mb-2 flex w-full items-center justify-between rounded p-2">
          <span>{selectedWallet.value.wallet.name}</span>
          <button
            class="cursor-pointer rounded bg-red-500 p-2 text-white"
            onClick$={() => {
              isDeleteModalopen.value = !isDeleteModalopen.value;
            }}
          >
            Delete
          </button>
        </div>
        <div class="mb-2 flex w-full flex-col items-start justify-start rounded p-2">
          <p>
            Network: {chainIdToNetworkName[selectedWallet.value.wallet.chainId]}
          </p>
          <p>Address: {selectedWallet.value.wallet.address}</p>
          <p>Native Balance: {formattedNativeBalance}</p>
          {selectedWallet.value.tokens.map((token: any) => {
            return (
              <div key={token.id}>
                <p class="mt-2">Token name: {token.name}</p>
                <p>Token symbol: {token.symbol}</p>
                <p>Token balance: {token.balance}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
