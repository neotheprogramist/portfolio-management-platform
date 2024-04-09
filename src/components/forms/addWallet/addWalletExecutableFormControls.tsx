import { component$, useSignal } from "@builder.io/qwik";
import { type addWalletFormStore } from "~/routes/app/wallets";
import {
  isPrivateKey32Bytes,
  isPrivateKeyHex,
  isValidName,
} from "~/utils/validators/addWallet";
import { isNameUnique as isNameUniqueServer } from "~/utils/validators/addWallet";

export interface AddWalletFormProps {
  addWalletFormStore: addWalletFormStore;
  onConnectWalletClick: () => void;
}

export default component$<AddWalletFormProps>(({ addWalletFormStore, onConnectWalletClick }) => {
  const isPrivateKeyInputVisible = useSignal(false);
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

      <label for="" class="flex gap-2 pb-1 text-xs text-white">
        Private Key
        {!isPrivateKey32Bytes(addWalletFormStore.privateKey) ? (
          <span class=" text-xs text-red-500">
            Invalid length. Private key must be 64 characters long.
          </span>
        ) : !isPrivateKeyHex(addWalletFormStore.privateKey) ? (
          <span class=" text-xs text-red-500">
            Invalid format. Private key must be a hexadecimal string.
          </span>
        ) : null}
      </label>
      {/* <div class="mb-5 flex items-center gap-2">
        <input
          type={isPrivateKeyInputVisible.value ? "text" : "password"}
          name="privateKey"
          class={`border-white-opacity-20  block w-[80%] rounded bg-transparent p-3 text-white 
          ${!isPrivateKey32Bytes(addWalletFormStore.privateKey) || !isPrivateKeyHex(addWalletFormStore.privateKey) ? "border-red-700" : ""}`}
          value={addWalletFormStore.privateKey}
          onInput$={(e) => {
            const target = e.target as HTMLInputElement;
            addWalletFormStore.privateKey = target.value;
          }}
        />
       
        <button
          type="button"
          onClick$={() => {
            isPrivateKeyInputVisible.value = !isPrivateKeyInputVisible.value;
          }}
        >
          {isPrivateKeyInputVisible.value ? "Hide" : "Show"}
        </button> 
      </div> */}

      <input type="hidden" name="address" value={addWalletFormStore.address} />

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
      <label for="network" class="block pb-1 text-xs text-white">
        Wallet Address
      </label>
       <button 
       onClick$={onConnectWalletClick}
       class="mt-2 h-[32px] rounded-3xl border-none bg-blue-500 px-[16px] text-xs font-semibold text-white duration-300 ease-in-out hover:scale-110"
       >Connect Wallet</button>
    </>
  );
});
