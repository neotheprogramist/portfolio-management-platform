import { type Signal, component$ } from "@builder.io/qwik";
import { Structure } from "~/interface/structure/Structure";

interface createdStructuresProps {
  createdStructure: Structure;
  selectedStructure: Signal<Structure | null>;
}

export const CreatedStructure = component$<createdStructuresProps>(
  ({ createdStructure, selectedStructure }) => {
    return (
      <div
        class="m-2 cursor-pointer rounded bg-gray-200 p-2 shadow-md"
        onClick$={() => {
          selectedStructure.value = createdStructure;
        }}
      >
        <div class="text-lg font-bold">{createdStructure.name}</div>
        <div class="text-base text-gray-500"></div>
      </div>
    );
  },
);
