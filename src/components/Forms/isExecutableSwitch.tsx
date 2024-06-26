import { component$ } from "@builder.io/qwik";
// import { Select } from "~/components/select/select";
import { type addWalletFormStore } from "~/routes/app/wallets";

export interface AddWalletFormProps {
  addWalletFormStore: addWalletFormStore;
}

export default component$<AddWalletFormProps>(({ addWalletFormStore }) => {
  return (
    <>
      <div class="mb-4">
        <p class="pb-1 text-xs text-white">Type</p>
        <div class="custom-bg-white custom-border-1 grid grid-cols-[50%_50%] rounded p-1">
          <button
            onClick$={() => {
              addWalletFormStore.isExecutable = 0;
            }}
            type="button"
            class={`${addWalletFormStore.isExecutable ? "bg-black" : "custom-bg-button"}  col-span-1 rounded p-2.5 text-white`}
          >
            Observable
          </button>
          <button
            onClick$={() => {
              addWalletFormStore.isExecutable = 1;
            }}
            type="button"
            class={`${addWalletFormStore.isExecutable ? "custom-bg-button" : "bg-black"} col-span-1 rounded p-2.5  text-white`}
          >
            Executable
          </button>
          <input
            type="hidden"
            value={addWalletFormStore.isExecutable}
            name="isExecutable"
          />
        </div>
      </div>
    </>
  );
});
