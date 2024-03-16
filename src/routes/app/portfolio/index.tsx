import { Button } from "~/components/portfolio/button-master/button";
import EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";
import Graph from "/public/images/chart.png?jsx";
import Bitcoin from "/public/images/svg/portfolio/btc.svg?jsx";
import { Group } from "~/components/groups/group";
import {
  component$,
  type JSXOutput,
  useSignal,
  useStore,
} from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { connectToDB } from "~/utils/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import {
  getDBTokenPriceUSD,
  getResultAddresses,
  getWalletDetails,
} from "~/interface/wallets/observedWallets";
import { type Wallet } from "~/interface/auth/Wallet";
import { Modal } from "~/components/modal";
import { isValidName } from "~/utils/validators/addWallet";
import { structureExists } from "~/interface/structure/removeStructure";

type WalletWithBalance = {
  wallet: { id: string; chainID: number; name: string };
  balance: [{ balanceId: string; tokenId: string; tokenSymbol: string }];
};
export const useDeleteGroup = routeAction$(
  async (structure, requestEvent) => {
    const db = await connectToDB(requestEvent.env);

    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    if (!(await structureExists(db, structure.id))) {
      throw new Error("Structure does not exist");
    }

    await db.delete(structure.id as string);

    return {
      success: true,
      structure: { id: structure.id },
    };
  },
  zod$({
    id: z.string(),
  }),
);
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
      const [tokenValue] = await getDBTokenPriceUSD(db, token[0].address);
      const tokenWithBalance = {
        id: token[0].id,
        name: token[0].name,
        symbol: token[0].symbol,
        decimals: token[0].decimals,
        balance: tokenBalance[0].value,
        balanceValueUSD: tokenValue.priceUSD,
      };

      structureTokens.push({
        wallet: {
          id: wallet.id,
          name: wallet.name,
          chainId: wallet.chainId,
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
  const deleteStructureAction = useDeleteGroup();
  const structureStore = useStore({ name: "" });
  const selectedWallets = useStore({ wallets: [] as any[] });
  const observedWalletsWithBalance = useObservedWalletBalances();

  return (
    <>
      <div class="grid grid-rows-[64px_auto] overflow-auto bg-[#F4F4F4] px-[20px] text-black">
        <div class="flex h-[64px] items-center justify-between">
          <div class="flex items-center gap-[8px] text-[20px]">
            <h2>Portfolio name</h2>
            <EditIcon />
          </div>
          <div class="flex items-center gap-[8px]">
            <Button
              image="/images/svg/portfolio/report-data.svg"
              text="Generate report"
            />
            <Button
              image="/images/svg/portfolio/rebalance.svg"
              text="Rebalance"
            />
            <Button image="/images/svg/portfolio/dca.svg" text="DCA" />
            <Button
              image="/images/svg/portfolio/structures.svg"
              text="See all structures"
            />
            <Button
              image="/images/svg/portfolio/add.svg"
              text="Create new structure"
              newClass="bg-[#0C63E9] text-white"
              onClick$={() => {
                isCreateNewStructureModalOpen.value =
                  !isCreateNewStructureModalOpen.value;
              }}
            />
          </div>
        </div>
        <div class="grid grid-cols-[2fr_1fr] gap-[10px] pb-[20px]">
          <div class="flex min-h-[260px] min-w-[580px] flex-col gap-[20px] overflow-auto rounded-[8px] bg-white p-[20px]">
            <p class="text-[16px] font-medium">Token list</p>
            <div class="flex gap-[8px]">
              <Button
                image="/images/svg/portfolio/search.svg"
                text="Search for name"
                newClass="min-w-[240px] justify-start pl-[6px] text-[#A8A8A8]"
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Subportfolio"
                newClass="flex-row-reverse"
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Wallet"
                newClass="flex-row-reverse "
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Network"
                newClass="flex-row-reverse"
              />
            </div>
            <div class="grid grid-rows-[40px_auto] items-center overflow-auto text-[14px] text-[#222222]">
              <div
                style="grid-template-columns: minmax(200px, 400px) minmax(100px, 200px) repeat(4, minmax(145px, 300px)) 16px;"
                class="grid h-full items-center gap-[8px] border-b px-[20px] text-[10px] text-[#222222] text-opacity-[50%]"
              >
                <div class="">TOKEN NAME</div>
                <div class="">QUANTITY</div>
                <div class="">VALUE</div>
                <div class="flex items-center gap-[8px]">
                  CHANGE
                  <div
                    class="flex items-center justify-center rounded-sm bg-[#F0F0F0]"
                    style="height: 20px; width: 80px;"
                  >
                    <button class="h-[16px] w-[25px] rounded-sm bg-white">
                      24h
                    </button>
                    <button class="h-[16px] w-[25px] text-[#A7A7A7]">3d</button>
                    <button class="h-[16px] w-[25px] text-[#A7A7A7]">
                      30d
                    </button>
                  </div>
                </div>
                <div class="text-[10px] font-normal text-[#222222] text-opacity-[50%]">
                  WALLET
                </div>
                <div class="text-[10px] font-normal text-[#222222] text-opacity-[50%]">
                  NETWORK
                </div>
                <div class="pr-[20px]"></div>
              </div>
              {availableStructures.value.map((createdStructures) => (
                <Group
                  key={createdStructures.structure.name}
                  createdStructure={createdStructures}
                  onClick$={async () => {
                    await deleteStructureAction.submit({
                      id: createdStructures.structure.id,
                    });
                  }}
                />
              ))}
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
          <div class="flex min-w-[440px] flex-col gap-[25px] overflow-auto rounded-[8px] bg-white p-[20px]">
            <div class="flex h-[32px] items-center justify-between gap-[5px]">
              <p class="text-base">Details</p>
              <div class="flex gap-[5px]">
                <Button
                  image="/images/svg/portfolio/rebalance.svg"
                  text="Rebalance"
                  newClass="min-w-[116px]"
                />
                <Button
                  image="/images/svg/portfolio/rebalance.svg"
                  text="Rebalance"
                  newClass="min-w-[116px]"
                />
              </div>
            </div>
            <div class="flex h-[64px] items-center gap-[16px]">
              <div class="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#E6E6E6]">
                <Bitcoin width={40} height={40} class="min-w-[40px]" />
              </div>
              <div class="flex flex-col gap-[4px]">
                <h4 class="text-[18px]">Wrapped Bitcoin</h4>
                <p class="text-xs text-[#222222] text-opacity-50">WBTC</p>
              </div>
            </div>
            <div class="flex flex-col gap-[20px]">
              <p class="mt-[11px] text-[18px]">$82 617,96</p>
              <div class="flex gap-[12px] text-sm">
                <p>TRANSFER</p>
                <p>RECEIVE</p>
              </div>
              <div class="grid h-[32px] grid-cols-4 items-center rounded-[4px] bg-[#F0F0F0] text-[10px] text-[#A7A7A7]">
                <button class="h-[28px]">Hour</button>
                <button class="h-[28px] rounded-sm bg-white text-black">
                  Day
                </button>
                <button class="h-[28px]">Month</button>
                <button class="h-[28px]">Year</button>
              </div>
              <div class="">
                <Graph class="max-w-auto min-w-[400px]" />
              </div>
            </div>
            <div class="mt-[28px] flex min-w-[370px] flex-col gap-[20px]">
              <h4 class="text-base font-medium">Market data</h4>
              <p class="font-regular text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                magna diam, dapibus sed justo ac, pretium aliquet augue. Sed sit
                amet vulputate felis, vel bibendum ligula. Cras sed erat libero.
                Curabitur pretium, sem vitae scelerisque euismod, metus arcu
                pretium tellus, ac interdum enim felis vitae diam. Vivamus quis
                lacinia justo, in porttitor massa. Suspendisse blandit ex sed
                gravida malesuada. Name eleifend at dui non viverra. Nullam ut
                congue odio. Curabitur ac turpis ipsum. Nulla vel eros
                scelerisque, vehicula diam vitae, cursus eros. Donec et turpis
                eget sapien faucibus placerat quis vel mauris. Mauris ultricies
                eget sem eu semper. Aenean non viverra dui. Curabitur placerat
                risus at leo ornare mollis
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

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
