import { component$ } from "@builder.io/qwik";
import { FormBadge } from "~/components/FormBadge/FormBadge";

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
      <div class="mb-8">
        {addWalletFormStore.coinsToCount.map((symbol) => (
          <div class="flex flex-col" key={symbol}>
            <FormBadge
              key={symbol}
              image={`/assets/icons/tokens/${symbol.toLowerCase()}.svg`}
              description={symbol}
              class="mb-2"
              input={
                <input
                  type="text"
                  name={`${symbol}Amount`}
                  class={` absolute end-2 block h-9 w-1/2 rounded border border-[#24a148] bg-transparent p-3 text-sm text-[#24a148] placeholder-white placeholder-opacity-50`}
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
              }
              hasImg={"/public/assets/icons/dashboard/success.svg?jsx"}
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
