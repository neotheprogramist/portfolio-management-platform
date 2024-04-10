import { type QRL, component$, $ } from "@builder.io/qwik";
import { getAddress } from "viem";
import { type addWalletFormStore } from "~/routes/app/wallets";
import { useDebouncer } from "~/utils/debouncer";
import {
  isCheckSum,
  isNameUnique,
  isValidAddress,
  isValidName,
} from "~/utils/validators/addWallet";

export interface AddWalletFormFieldsProps {
  addWalletFormStore: addWalletFormStore;
  onConnectWalletClick: QRL<() => void>;
  isWalletConnected: boolean | undefined;
}

export default component$<AddWalletFormFieldsProps>(
  ({ addWalletFormStore, onConnectWalletClick, isWalletConnected }) => {
    const nameInputDebounce = useDebouncer(
      $(async (value: string) => {
        addWalletFormStore.isNameUnique = await isNameUnique(value);
      }),
      300,
    );

    return (
      <>
        <div>
          <label for="network" class="block pb-1 text-xs text-white">
            Networker
          </label>
          <input
            type="text"
            name="network"
            class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
            placeholder="Select network"
            disabled={true}
          />
        </div>
        <div>
          <label for="name" class="flex gap-2 pb-1 text-xs text-white">
            Name
            {!isValidName(addWalletFormStore.name) && (
              <span class="text-xs text-red-500">Invalid name</span>
            )}
            {!addWalletFormStore.isNameUnique && (
              <span class="text-xs text-red-500">Name already exists</span>
            )}
          </label>
          <input
            type="text"
            name="name"
            class={`border-white-opacity-20 mb-5 block w-[80%] rounded bg-transparent p-3 text-white 
               ${!isValidName(addWalletFormStore.name) ? "border-red-700" : ""}`}
            value={addWalletFormStore.name}
            placeholder="Enter wallet name..."
            onInput$={async (e) => {
              addWalletFormStore.isNameUnique = false;
              const target = e.target as HTMLInputElement;
              addWalletFormStore.name = target.value;
              nameInputDebounce(target.value);
            }}
          />
        </div>
        <div class="flex flex-col">
          <label
            for="address"
            class="mb-6 flex items-center justify-between gap-2 pb-1 text-xs text-white"
          >
            Wallet Address
            {addWalletFormStore.isExecutable ? (
              <div>
                <button
                  onClick$={onConnectWalletClick}
                  class={`mt-2 h-[32px] rounded-3xl border-none ${isWalletConnected ? "" : "bg-blue-500"} px-[16px] text-xs font-semibold text-white duration-300 ease-in-out hover:scale-110`}
                >
                  {isWalletConnected ? "Disconnect " : "Connect Wallet"}
                </button>
              </div>
            ) : (
              <div>
                {!isValidAddress(addWalletFormStore.address) ? (
                  <span class=" text-xs text-red-500">Invalid address</span>
                ) : !isCheckSum(addWalletFormStore.address) ? (
                  <span class=" text-xs text-red-500">
                    Convert your address to the check sum before submitting.
                  </span>
                ) : null}
              </div>
            )}
          </label>

          {addWalletFormStore.isExecutable ? (
            <div>
              {isWalletConnected ? (
                <div
                  class={`flex h-12 w-full items-center justify-center rounded border border-[#24A148] bg-transparent p-3 text-[#24A148]`}
                >
                  wallet address
                  {/* {addWalletFormStore.address.substring(0,6)}... */}
                </div>
              ) : (
                <div
                  class={`mb-10 flex h-12 w-full items-center justify-center rounded border border-[#FDD835] bg-transparent p-3 text-[#FDD835]`}
                >
                  Wallet not connected
                </div>
              )}
            </div>
          ) : (
            <div class="mb-5 flex items-center gap-2">
              <input
                type="text"
                name="address"
                class={`border-white-opacity-20  block w-[80%] rounded bg-transparent p-3 text-white 
                 ${!isValidAddress(addWalletFormStore.address) ? "border-red-700" : ""}`}
                value={addWalletFormStore.address}
                placeholder="Enter wallet address..."
                onInput$={(e) => {
                  const target = e.target as HTMLInputElement;
                  addWalletFormStore.address = target.value;
                }}
              />
              {isValidAddress(addWalletFormStore.address) &&
              !isCheckSum(addWalletFormStore.address) ? (
                <button
                  class="border-buttons h-[32px] rounded-3xl px-[8px] text-xs font-normal text-white duration-300 ease-in-out hover:scale-110"
                  type="button"
                  onClick$={() => {
                    addWalletFormStore.address = getAddress(
                      addWalletFormStore.address,
                    );
                  }}
                >
                  Convert
                </button>
              ) : null}
            </div>
          )}
        </div>
      </>
    );
  },
);
