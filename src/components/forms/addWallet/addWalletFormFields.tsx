import { type QRL, component$, $ } from "@builder.io/qwik";
import { getAddress } from "viem";
import { Input } from "~/components/input/input";
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
        addWalletFormStore.isNameUniqueLoading = true;
        addWalletFormStore.isNameUnique = await isNameUnique(value);
        addWalletFormStore.isNameUniqueLoading = false;
      }),
      300,
    );

    return (
      <>
        {/* network */}
        <div class="mb-4">
          <label for="network" class="block pb-1 text-xs text-white">
            Networker
          </label>
          <Input
            type="text"
            name="network"
            placeholder="Select network"
            disabled={true}
          />
        </div>
        {/* Name */}
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
          <Input
            type="text"
            name="name"
            customClass={` 
              ${!isValidName(addWalletFormStore.name) ? "border-red-700" : ""}`}
            value={addWalletFormStore.name}
            placeholder="Enter wallet name..."
            onInput={$(async (e) => {
              const target = e.target as HTMLInputElement;
              addWalletFormStore.name = target.value;
              nameInputDebounce(target.value);
            })}
          />
        </div>
        {/* Address */}
        <div class="flex flex-col">
          <label
            for="address"
            class="flex items-center justify-between gap-2 pb-1 text-xs text-white"
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
                  class={`bg-transparent-10 mb-4 mt-2 flex h-12 w-full items-center justify-center rounded border border-[#24A148] bg-[#24A148] bg-transparent p-3 text-[#24A148]`}
                >
                  wallet address
                  {/* {addWalletFormStore.address.substring(0,6)}... */}
                </div>
              ) : (
                <div
                  class={`bg-transparent-10 mb-4 mt-2 flex h-12 w-full items-center justify-center rounded border border-[#FDD835] bg-[#FDD835] bg-transparent p-3 text-[#FDD835]`}
                >
                  Wallet not connected
                </div>
              )}
            </div>
          ) : (
            <div class="mb-5 flex items-center">
              <Input
                type="text"
                name="address"
                customClass={` 
                ${!isValidAddress(addWalletFormStore.address) ? "border-red-700" : ""}`}
                value={addWalletFormStore.address}
                placeholder="Enter wallet address..."
                onInput={$((e) => {
                  const target = e.target as HTMLInputElement;
                  addWalletFormStore.address = target.value;
                })}
              />

              <button
                class="custom-border-1 ml-2 h-[32px] rounded-3xl px-[8px] text-xs font-normal text-white disabled:cursor-default disabled:bg-gray-400"
                type="button"
                onClick$={() => {
                  addWalletFormStore.address = getAddress(
                    addWalletFormStore.address,
                  );
                }}
                disabled={
                  addWalletFormStore.address.length === 0 ||
                  !isValidAddress(addWalletFormStore.address) ||
                  !isCheckSum(addWalletFormStore.address)
                }
              >
                Convert
              </button>
            </div>
          )}
        </div>
      </>
    );
  },
);
