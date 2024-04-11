import { type QRL, component$, $ } from "@builder.io/qwik";

import { type addWalletFormStore } from "~/routes/app/wallets";

export interface Step3Props {}

export default component$<Step3Props>(({}) => {
  return (
    <>
      <div>
        <div class="flex flex-col">
          <label for="receivingWallet" class="block pb-1 text-xs text-white">
            Amount
          </label>
          <input
            type="text"
            name="transferredTokenAmount"
            class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
            placeholder="Approval Limit"
            // value={transferredTokenAmount.value}
            onInput$={(e) => {
              const target = e.target as HTMLInputElement;
              const regex = /^\d*\.?\d*$/;
              //   target.value = replaceNonMatching(target.value, regex, "");
              //   transferredTokenAmount.value = target.value;
            }}
          />
          {/* <span class="block pb-1 text-xs text-white">
                {!chekckIfProperAmount(
                  transferredTokenAmount.value,
                  /^\d*\.?\d*$/,
                ) ? (
                  <span class="text-xs text-red-500">
                    Invalid amount. There should be only one dot.
                  </span>
                ) : null}
              </span> */}
        </div>
      </div>
    </>
  );
});
