import { component$, JSXOutput, useSignal, useStore } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { connectToDB } from "~/utils/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Modal } from "~/components/modal";
import { CreatedStructure } from "~/components/structures/created";
import { Structure } from "~/interface/structure/Structure";
import { SelectedStructureDetails } from "~/components/structures/details";
import { TokenWithBalance } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import {
  getResultAddresses,
  getWalletDetails,
} from "~/interface/wallets/observedWallets";
import { Wallet } from "~/interface/auth/Wallet";

type WalletWithBalance = {
  wallet: { id: string; chainID: number; name: string };
  balance: [{ balanceId: string; tokenId: string; tokenSymbol: string }];
};
export const useObservedWalletBalances = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const resultAddresses: any = await getResultAddresses(db, userId);
  if (!resultAddresses[0]["->observes_wallet"].out.address.length) {
    return [];
  }
  const walletsWithBalance = [];
  let balanceDetails = [];

  for (const observedWalletAddress of resultAddresses[0]["->observes_wallet"]
    .out.address) {
    const walletDetails = await getWalletDetails(db, observedWalletAddress);

    const [balances]: any = await db.query(
      `SELECT id FROM balance WHERE ->(for_wallet WHERE out = '${walletDetails[0].id}')`,
    );

    for (const balance of balances) {
      const [tokenId]: any = await db.query(`
      SELECT ->for_token.out FROM ${balance.id}`);

      const [tokenDetails]: any = await db.query(`
      SELECT * FROM ${tokenId[0]["->for_token"].out[0]}`);

      const walletBalance = {
        balanceId: balance.id,
        tokenId: tokenDetails[0].id,
        tokenSymbol: tokenDetails[0].symbol,
      };
      balanceDetails.push(walletBalance);
    }

    const walletWithBalance = {
      wallet: walletDetails[0],
      balance: balanceDetails,
    };
    balanceDetails = [];

    walletsWithBalance.push(walletWithBalance);
  }
  return walletsWithBalance;
});

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
    const [structure] = await db.select(`${createdStructure}`);
    const structureTokens: any = [];
    const [structureBalances]: any = await db.query(`
    SELECT ->structure_balance.out FROM ${structure.id}`);

    for (const balance of structureBalances[0]["->structure_balance"].out) {
      const [walletId]: any = await db.query(`
        SELECT out  FROM for_wallet WHERE in = ${balance}`);
      const [wallet] = await db.select<Wallet>(`${walletId[0].out}`);

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

      structureTokens.push({
        wallet: {
          id: wallet.id,
          name: wallet.name,
        },
        balance: tokenWithBalance,
      });
    }

    availableStructures.push({
      structure: {
        id: structure.id,
        name: structure.name,
      },
      structureBalance: structureTokens,
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

    for (const balanceId of data.balancesId) {
      await db.query(`
      relate only ${structure[0].id}-> structure_balance -> ${balanceId}`);
    }

    return {
      success: true,
      structure: { name: data.name, balances: data.balancesId },
    };
  },
  zod$({
    name: z.string(),
    balancesId: z.array(z.string()),
  }),
);
export default component$(() => {
  const availableStructures = useAvailableStructures();
  const isCreateNewStructureModalOpen = useSignal(false);
  const createStructureAction = useCreateStructure();
  const structureStore = useStore({ name: "" });
  const selectedWallets = useStore({ wallets: [] as any[] });
  const selectedStructure = useSignal<Structure | null>(null);
  const isDeleteModalOpen = useSignal(false);
  const observedWalletsWithBalance = useObservedWalletBalances();

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
                    return observedWalletsWithBalance.value.find(
                      (observedWallet) =>
                        observedWallet.wallet.id === option.value,
                    );
                  },
                ).filter(Boolean);
              }}
            >
              <option disabled={true}>Select Wallets</option>
              {observedWalletsWithBalance.value.map((option) => (
                <option key={option.wallet.id} value={option.wallet.id}>
                  {option.wallet.name}
                </option>
              ))}
            </select>
            <label for="balance" class="block">
              Tokens
            </label>
            <select name="balancesId[]" multiple>
              <option disabled={true}>Select Tokens</option>
              {parseWalletsToOptions(selectedWallets.wallets)}
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

function parseWalletsToOptions(wallets: WalletWithBalance[]): JSXOutput[] {
  const options: JSXOutput[] = [];

  wallets.forEach((item) => {
    item.balance.forEach((balance) => {
      options.push(
        <option key={balance.balanceId} value={balance.balanceId}>
          {`${balance.tokenSymbol} - ${item.wallet.name}`}
        </option>,
      );
    });
  });
  return options;
}
