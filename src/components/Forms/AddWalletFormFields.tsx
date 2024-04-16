import { type QRL, component$, $ } from "@builder.io/qwik";
import { getAddress } from "viem";
import { Input } from "~/components/Input/Input";
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
          <label for="network" class="custom-text-50 pb-2 text-xs uppercase">
            Network
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
          {!isValidName(addWalletFormStore.name) && (
            <span class="absolute start-[70px] pt-[1px] text-xs text-red-500">
              Invalid name
            </span>
          )}
          {!addWalletFormStore.isNameUnique && (
            <span class="absolute start-[70px] pt-[1px] text-xs text-red-500">
              Name already exists
            </span>
          )}
          <Input
            text="Wallet Name"
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
        <div>
          <label
            for="address"
            class="custom-text-50 flex items-center justify-between gap-2 text-xs uppercase"
          >
            Wallet Address
            {!addWalletFormStore.isExecutable ? (
              <div>
                {!isValidAddress(addWalletFormStore.address) ? (
                  <span class=" text-xs text-red-500">Invalid address</span>
                ) : !isCheckSum(addWalletFormStore.address) ? (
                  <span class=" text-xs text-red-500">
                    Convert your address to the check sum before submitting.
                  </span>
                ) : null}
              </div>
            ) : (
              <div>
                <button
                  onClick$={onConnectWalletClick}
                  class={`h-8 rounded-3xl border-none ${isWalletConnected ? "" : "bg-customBlue"} px-4 text-xs font-semibold text-white duration-300 ease-in-out hover:scale-105`}
                >
                  {isWalletConnected ? "Disconnect " : "Connect Wallet"}
                </button>
              </div>
            )}
          </label>

          {!addWalletFormStore.isExecutable ? (
            <div class="mb-5 grid grid-cols-[75%_25%] items-center justify-between">
              <Input
                type="text"
                name="address"
                customClass={`${!isValidAddress(addWalletFormStore.address) ? "border-red-700" : ""} mt-4 w-full`}
                value={addWalletFormStore.address}
                placeholder="Enter wallet address..."
                onInput={$((e) => {
                  const target = e.target as HTMLInputElement;
                  addWalletFormStore.address = target.value;
                })}
              />

              <button
                class="custom-border-1 ml-2 h-8 rounded-3xl px-2 text-xs font-normal text-white disabled:cursor-default disabled:bg-[#e6e6e6] disabled:text-gray-500"
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
          ) : (
            <div>
              {isWalletConnected ? (
                <div
                  class={`mb-8 mt-4 flex h-12 w-full items-center justify-center rounded-lg border border-customGreen bg-customGreen bg-opacity-10 p-3 text-customGreen`}
                >
                  {addWalletFormStore.address
                    ? `${addWalletFormStore.address.substring(0, 6)}...`
                    : "wallet address"}
                </div>
              ) : (
                <div
                  class={`mb-8 mt-4 flex h-12 w-full items-center justify-center rounded-lg border border-customWarning bg-customWarning bg-opacity-10 p-3 text-customWarning`}
                >
                  Wallet not connected
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);
