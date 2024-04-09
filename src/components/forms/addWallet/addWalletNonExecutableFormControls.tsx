import { component$ } from "@builder.io/qwik";
import { getAddress } from "viem";
import { type addWalletFormStore } from "~/routes/app/wallets";
import {
  isCheckSum,
  isValidAddress,
  isValidName,
} from "~/utils/validators/addWallet";
import { isNameUnique as isNameUniqueServer } from "~/utils/validators/addWallet";

export interface AddWalletFormProps {
  addWalletFormStore: addWalletFormStore;
}

export default component$<AddWalletFormProps>(({ addWalletFormStore }) => {
  return (
    <>
      <label for="name" class="flex gap-2 pb-1 text-xs text-white">
        Name
        {!isValidName(addWalletFormStore.name) && (
          <span class="text-xs text-red-500">Invalid name</span>
        )}
      </label>
      <input
        type="text"
        name="name"
        class={`border-white-opacity-20 mb-5 block w-[80%] rounded bg-transparent p-3 text-white 
              ${!isValidName(addWalletFormStore.name) ? "border-red-700" : ""}`}
        value={addWalletFormStore.name}
        onInput$={async (e) => {
          const target = e.target as HTMLInputElement;
          addWalletFormStore.name = target.value;
          addWalletFormStore.isNameUnique = await isNameUniqueServer(
            target.value,
          );
        }}
      />
      <label for="address" class="flex gap-2 pb-1 text-xs text-white">
        Address
        {!isValidAddress(addWalletFormStore.address) ? (
          <span class=" text-xs text-red-500">Invalid address</span>
        ) : !isCheckSum(addWalletFormStore.address) ? (
          <span class=" text-xs text-red-500">
            Convert your address to the check sum before submitting.
          </span>
        ) : null}
      </label>
      <div class="mb-5 flex items-center gap-2">
        <input
          type="text"
          name="address"
          class={`border-white-opacity-20  block w-[80%] rounded bg-transparent p-3 text-white 
                ${!isValidAddress(addWalletFormStore.address) ? "border-red-700" : ""}`}
          value={addWalletFormStore.address}
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
      <label for="network" class="block pb-1 text-xs text-white">
        Network
      </label>
      <input
        type="text"
        name="network"
        class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
        placeholder="Select network"
        disabled={true}
      />
    </>
  );
});
