import { component$ } from "@builder.io/qwik";
import { type AddWalletFormProps } from "./addWalletNonExecutableFormControls";

export default component$<AddWalletFormProps>(({ addWalletFormStore }) => {
  return (
    <>
      <div class="mb-5">
        <p class="pb-1 text-xs text-white">Type</p>
        <div class="bg-glass border-white-opacity-20 grid grid-cols-[50%_50%] rounded p-1">
          <button
            onClick$={() => {
              addWalletFormStore.isExecutable = 1;
              console.log("isExecutable", !!addWalletFormStore.isExecutable);
            }}
            type="button"
            class={`${addWalletFormStore.isExecutable ? "color-gradient" : "bg-black"} col-span-1 rounded p-2.5  text-white`}
          >
            Executable
          </button>
          <button
            onClick$={() => {
              addWalletFormStore.isExecutable = 0;
              console.log("isExecutable", !!addWalletFormStore.isExecutable);
            }}
            type="button"
            class={`${addWalletFormStore.isExecutable ? "bg-black" : "color-gradient"} col-span-1 rounded p-2.5  text-white`}
          >
            Read-only
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
