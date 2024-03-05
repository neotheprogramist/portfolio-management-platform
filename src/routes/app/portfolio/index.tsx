import { component$, useSignal, useStore } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  zod$,
  z,
} from "@builder.io/qwik-city";
import { connectToDB } from "~/utils/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Modal } from "~/components/modal";
import { isAddress } from "viem";
import { CreatedStructure } from "~/components/structures/created";
import { Structure } from "~/interface/structure/Structure";

export const useAvailableStructures = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);
  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(`
    SELECT ->has_structure.out FROM ${userId}`);

  if (!result) throw new Error("No structures available");
  const createdStructureQueryResult = result[0]["->has_structure"].out;
  const availableStructures: any[] = [];

  for (const createdStructure of createdStructureQueryResult) {
    const [structure] = await db.select<Structure>(`${createdStructure}`);

    availableStructures.push({
      structure: {
        id: structure.id,
        name: structure.name,
      },
    });
  }
  console.log(availableStructures)
  return availableStructures;
});
export const useCreateStructure = routeAction$(
  async (data, requestEvent) => {
    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const db = await connectToDB(requestEvent.env);
    const structure = await db.create("structure", {
      name: data.name,
    });

    await db.query(`
    RELATE ONLY ${userId}-> has_structure -> ${structure[0].id}`);
    return {
      success: true,
      structure: { name: data.name },
    };
  },
  zod$({
    address: z.string().refine((address) => isAddress(address), {
      message: "Invalid address",
    }),
    name: z.string(),
  }),
);
export default component$(() => {
  const availableStructures = useAvailableStructures();
  const isCreateNewStructureModalOpen = useSignal(false);
  const createStructureAction = useCreateStructure();
  const structureNameStore = useStore({ name: "", address: "" });
  const selectedStructure = useSignal<Structure | null>(null);

  return (
    <div class="grid  grid-cols-2 gap-4 p-8">
      <div class="max-h-600 flex flex-col overflow-auto p-2">
        <div class="flex justify-between">
          <span>Portfolio</span>
          <button
            class="cursor-pointer rounded bg-blue-500 p-2 text-white"
            onClick$={() => {
              isCreateNewStructureModalOpen.value =
                !isCreateNewStructureModalOpen.value;
            }}
          >
            Create new structure
          </button>
        </div>

        <div class="flex flex-col">
          {availableStructures.value.map((item) => (
            <CreatedStructure
              key={item.structure.name}
              createdStructure={item}
              selectedStructure={selectedStructure}
            />
          ))}
        </div>
      </div>

      {/*<div class="max-h-600 flex flex-col overflow-auto p-2">*/}
      {/*  {selectedStructure.value && (*/}
      {/*      <label*/}
      {/*          key={selectedStructure.value.structure.name}*/}
      {/*          selectedStructure={selectedStructure}*/}
      {/*      />*/}
      {/*  )}*/}
      {/*</div>*/}

      {isCreateNewStructureModalOpen.value && (
        <Modal
          isOpen={isCreateNewStructureModalOpen}
          title="Create new structure"
        >
          <Form
            action={createStructureAction}
            onSubmitCompleted$={() => {
              if (createStructureAction.value?.success) {
                isCreateNewStructureModalOpen.value = false;
              }
            }}
            class="mt-4"
          >
            <label for="name" class="block">
              Name
            </label>
            <input
              type="text"
              name="name"
              class={`mb-1 block w-full ${!isValidName(structureNameStore.name) ? "bg-red-300" : ""}`}
              value={structureNameStore.name}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                structureNameStore.name = target.value;
              }}
            />
            {!isValidName(structureNameStore.name) && (
              <p class="mb-4 text-red-500">Invalid name</p>
            )}
            <label for="address" class="block">
              Wallet
            </label>
            <input
              type="text"
              name="address"
              class={`mb-1 block w-full ${!isValidAddress(structureNameStore.address) ? "bg-red-300" : ""}`}
              value={structureNameStore.address}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                structureNameStore.address = target.value;
              }}
            />
            {!isValidAddress(structureNameStore.address) && (
              <p class="mb-4 text-red-500">Invalid address</p>
            )}
            <button
              type="submit"
              class="absolute bottom-4 right-4"
              disabled={
                !isValidName(structureNameStore.name) ||
                !isValidAddress(structureNameStore.address)
              }
            >
              Create structure
            </button>
          </Form>
        </Modal>
      )}
    </div>
  );
});

function isValidName(name: string): boolean {
  return name.length > 0 ? name.trim().length > 3 : true;
}

function isValidAddress(address: string): boolean {
  return address.length > 0
    ? address.trim() !== "" && isAddress(address)
    : true;
}
