import { type Signal, component$ } from "@builder.io/qwik";
import { Structure } from "~/interface/structure/Structure";

interface SelectedStructureProps {
  selectedStructure: Signal<Structure | null>;
  isDeleteModalopen: Signal<boolean>;
}

export const SelectedStructureDetails = component$<SelectedStructureProps>(
  ({ selectedStructure, isDeleteModalopen }) => {
    if (!selectedStructure.value) return <></>;
    return (
      <div class="text-white">
        <div class="mb-2 flex w-full items-center justify-between rounded p-2">
          <span>{selectedStructure.value.structure.name}</span>
          <button
            class="cursor-pointer rounded bg-red-500 p-2 text-white"
            onClick$={() => {
              isDeleteModalopen.value = !isDeleteModalopen.value;
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  },
);
