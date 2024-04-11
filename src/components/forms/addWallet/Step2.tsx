import { type QRL, component$, $ } from "@builder.io/qwik";

import { type addWalletFormStore } from "~/routes/app/wallets";

export interface Step2Props {
  addWalletFormStore: addWalletFormStore;
}

export default component$<Step2Props>(({ addWalletFormStore }) => {
  const coins = ["GLM", "USDC", "USDT"];

  return (
    <>
      <div class="flex flex-col p-4">
        {coins.map((symbol) => (
          <label class="cursor-pointer py-2" for={symbol}>
            <input
              class="ml-2"
              id={symbol}
              name={symbol}
              type="checkbox"
              checked={addWalletFormStore.coinsToCount.includes(symbol)}
              value={symbol}
              onClick$={() => {
                console.log("coins: ", addWalletFormStore.coinsToCount);
                if (!addWalletFormStore.coinsToCount.includes(symbol)) {
                  addWalletFormStore.coinsToCount.push(symbol);
                } else {
                  const indexToRemove =
                    addWalletFormStore.coinsToCount.indexOf(symbol);

                  if (indexToRemove !== -1) {
                    addWalletFormStore.coinsToCount.splice(indexToRemove, 1);
                  }
                }
              }}
            />
            {symbol}
          </label>
        ))}
      </div>
    </>
  );
});
