import { component$ } from "@builder.io/qwik";

import {
  chekckIfProperAmount,
  replaceNonMatching,
  type addWalletFormStore,
} from "~/routes/app/wallets";

export interface AmountOfCoinsProps {
  addWalletFormStore: addWalletFormStore;
}

export default component$<AmountOfCoinsProps>(({ addWalletFormStore }) => {
  return (
    <>
      <div>
        {addWalletFormStore.coinsToCount.map((symbol) => (
          <div class="flex flex-col" key={symbol}>
            <label for="receivingWallet" class="block pb-1 text-xs text-white">
              Amount of {symbol}
            </label>
            <input
              type="text"
              name={`${symbol}Amount`}
              class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
              placeholder={`${symbol} approval limit`}
              value={
                addWalletFormStore.coinsToApprove.find(
                  (item) => item.symbol === symbol,
                )!.amount
              }
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                const regex = /^\d*\.?\d*$/;
                target.value = replaceNonMatching(target.value, regex, "");
                addWalletFormStore.coinsToApprove.find(
                  (item) => item.symbol === symbol,
                )!.amount = target.value;
              }}
            />
            <span class="block pb-1 text-xs text-white">
              {!chekckIfProperAmount(
                addWalletFormStore.coinsToApprove.find(
                  (item) => item.symbol === symbol,
                )!.amount,
                /^\d*\.?\d*$/,
              ) ? (
                <span class="text-xs text-red-500">
                  Invalid amount. There should be only one dot.
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </>
  );
});
