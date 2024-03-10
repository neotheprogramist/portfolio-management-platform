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
import { CreatedStructure } from "~/components/structures/created";
import { Structure, StructureBalance } from "~/interface/structure/Structure";
import { SelectedStructureDetails } from "~/components/structures/details";
import { useObservedWallets } from "~/routes/shared";
import {
  TokenWithBalance,
  WalletTokensBalances,
} from "~/interface/walletsTokensBalances/walletsTokensBalances";
export { useObservedWallets } from "~/routes/shared";

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
    const structureTokens: any = [];
    const [structureBalances]: any = await db.query(`
    SELECT ->structure_balance.out FROM ${structure.id}`);

    for (const balance of structureBalances[0]["->structure_balance"].out) {
      const [tokenBalance]: any = await db.query(`
    SELECT * FROM balance WHERE id=${balance}`);

      const [tokenId]: any = await db.query(`
    SELECT ->for_token.out FROM ${balance}`);

      const [token]: any = await db.query(
        `SELECT * FROM ${tokenId[0]["->for_token"].out[0]}`,
      );

      const tokenWithBalance: TokenWithBalance = {
        id: token[0].id,
        name: token[0].name,
        symbol: token[0].symbol,
        decimals: token[0].decimals,
        balance: tokenBalance[0].value,
      };

      structureTokens.push(tokenWithBalance);
    }

    availableStructures.push({
      structure: {
        id: structure.id,
        name: structure.name,
      },
      tokens: structureTokens,
    });
  }
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
    relate only ${userId}-> has_structure -> ${structure[0].id}`);

    for (const walletId of data.walletsId) {
      await db.query(`
      relate only ${structure[0].id}-> in_structure -> ${walletId}`);

      for (const tokenId of data.tokensId) {
        const [[balance]]: any = await db.query(
          `SELECT id FROM balance WHERE ->(for_wallet WHERE out = '${walletId}') AND ->(for_token WHERE out = '${tokenId}')`,
        );
        await db.query(`
    relate only ${structure[0].id}-> structure_balance -> ${balance.id}`);
      }
    }

    return {
      success: true,
      structure: { name: data.name, wallets: data.walletsId },
    };
  },
  zod$({
    name: z.string(),
    walletsId: z.array(z.string()),
    tokensId: z.array(z.string()),
  }),
);

export default component$(() => {
  const availableStructures = useAvailableStructures();
  const isCreateNewStructureModalOpen = useSignal(false);
  const createStructureAction = useCreateStructure();
  const observedWallets = useObservedWallets();
  const structureStore = useStore({ name: "" });
  const selectedWallets = useStore({ wallets: [] as WalletTokensBalances[] });
  const selectedStructure = useSignal<StructureBalance | null>(null);
  const isDeleteModalOpen = useSignal(false);

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
          {availableStructures.value.map((createdStructures) => (
            <CreatedStructure
              key={createdStructures.structure.name}
              createdStructure={createdStructures}
              selectedStructure={selectedStructure}
            />
          ))}
        </div>
      </div>

      <div class="max-h-600 flex flex-col overflow-auto p-2">
        {selectedStructure.value && (
          <SelectedStructureDetails
            key={selectedStructure.value.structure.name}
            selectedStructure={selectedStructure}
            isDeleteModalopen={isDeleteModalOpen}
          />
        )}
      </div>

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
              class={`mb-1 block w-full ${!isValidName(structureStore.name) ? "bg-red-300" : ""}`}
              value={structureStore.name}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                structureStore.name = target.value;
              }}
            />
            {!isValidName(structureStore.name) && (
              <p class="mb-4 text-red-500">Invalid name</p>
            )}
            <label for="walletsId" class="block">
              Wallet
            </label>
            <select
              name="walletsId[]"
              multiple
              onChange$={(e) => {
                const target = e.target as HTMLSelectElement;
                selectedWallets.wallets = Array.from(
                  target.selectedOptions,
                  (option) => {
                    const wallet = observedWallets.value.find(
                      (observedWallet) =>
                        observedWallet.wallet.id === option.value,
                    );
                    return wallet as WalletTokensBalances;
                  },
                ).filter(Boolean);
              }}
            >
              <option disabled={true}>Select Wallets</option>
              {observedWallets.value.map((option) => (
                <option key={option.wallet.id} value={option.wallet.id}>
                  {option.wallet.name}
                </option>
              ))}
            </select>
            <label for="tokens" class="block">
              Tokens
            </label>
            <select name="tokensId[]" multiple>
              <option disabled={true}>Select Tokens</option>
              {populateTokens(selectedWallets.wallets).map((token) => (
                <option key={token.id} value={token.id}>
                  {token.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              class="absolute bottom-4 right-4"
              disabled={!isValidName(structureStore.name)}
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

function populateTokens(
  selectedWallets: WalletTokensBalances[],
): TokenWithBalance[] {
  const selectedTokens: TokenWithBalance[] = [];

  selectedWallets.forEach((selectedWallet) => {
    selectedWallet.tokens.forEach((token) => {
      if (!selectedTokens.some((t) => t.id === token.id)) {
        selectedTokens.push(token);
      }
    });
  });
  return selectedTokens;
}
