import {
  Button,
  ButtonTokenList,
} from "~/components/portfolio/button-master/button";
import IconEdit from "/public/assets/icons/portfolio/edit.svg?jsx";
import ImgChart from "/public/assets/images/chart.png?jsx";
import IconBtc from "/public/assets/icons/portfolio/btc.svg?jsx";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import IconClose from "/public/assets/icons/close.svg?jsx";
import { Group } from "~/components/groups/group";
import {
  component$,
  type JSXOutput,
  useSignal,
  useStore,
  useTask$,
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
export const useDeleteStructure = routeAction$(
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
export const useDeleteToken = routeAction$(
  async (data, requestEvent) => {
    const db = await connectToDB(requestEvent.env);
    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    if (!(await structureExists(db, data.structureId))) {
      throw new Error("Structure does not exist");
    }

    await db.query(`
    DELETE structure_balance WHERE in=${data.structureId} AND out=${data.balanceId}`);

    const [balanceCount]: any = await db.query(`
    RETURN COUNT(SELECT id AS num_rows FROM structure_balance WHERE in=${data.structureId})`);

    if (balanceCount === 0) {
      await db.delete(data.structureId as string);
    }
  },
  zod$({
    structureId: z.string(),
    balanceId: z.string(),
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
      `SELECT id, value FROM balance WHERE ->(for_wallet WHERE out = '${walletDetails[0].id}')`,
    );

    for (const balance of balances) {
      if (balance.value === "0") {
        continue;
      }
      const [tokenId]: any = await db.query(`
      SELECT VALUE ->for_token.out FROM ${balance.id}`);

      const [tokenDetails]: any = await db.query(`
      SELECT * FROM ${tokenId[0]}`);

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
    SELECT VALUE ->has_structure.out FROM ${userId}`);

  if (!result) throw new Error("No structures available");
  const createdStructureQueryResult = result[0];
  const availableStructures: any[] = [];

  for (const createdStructure of createdStructureQueryResult) {
    const [structure] = await db.select(`${createdStructure}`);
    const structureTokens: any = [];
    const [structureBalances]: any = await db.query(`
      SELECT VALUE ->structure_balance.out
      FROM ${structure.id}`);

    if (!structureBalances[0].length) {
      await db.delete(structure.id);
    } else {
      for (const balance of structureBalances[0]) {
        const [walletId]: any = await db.query(`
        SELECT out
        FROM for_wallet
        WHERE in = ${balance}`);

        const [wallet] = await db.select<Wallet>(`${walletId[0].out}`);

        const [tokenBalance]: string[] = await db.query(`
        SELECT VALUE value
        FROM balance
        WHERE id = ${balance}`);

        const [tokenId]: any = await db.query(`
        SELECT VALUE ->for_token.out
        FROM ${balance}`);

        const [token]: any = await db.query(
          `SELECT *
         FROM ${tokenId[0]}`,
        );

        const [tokenValue] = await getDBTokenPriceUSD(db, token[0].address);
        const tokenWithBalance = {
          id: token[0].id,
          name: token[0].name,
          symbol: token[0].symbol,
          decimals: token[0].decimals,
          balance: tokenBalance[0],
          balanceValueUSD: tokenValue.priceUSD,
          balanceId: balance,
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
    let [namesList]: any = await db.query(`
    SELECT name FROM structure GROUP BY name`);

    namesList = namesList.map((item: { name: string }) => item.name.trim());

    if (namesList.includes(data.name)) {
      return {
        success: false,
        message: "Name already taken",
      };
    }
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
  const clickedToken = useStore({ balanceId: "", structureId: "" });
  const structureStore = useStore({ name: "" });
  const selectedWallets = useStore({ wallets: [] as any[] });
  const isCreateNewStructureModalOpen = useSignal(true);
  const deleteToken = useDeleteToken();
  const availableStructures = useAvailableStructures();
  const createStructureAction = useCreateStructure();
  const deleteStructureAction = useDeleteStructure();
  const observedWalletsWithBalance = useObservedWalletBalances();
  

  useTask$(async ({ track }) => {
    track(() => {
      clickedToken.structureId;
      clickedToken.balanceId;
      if (clickedToken.structureId !== "" && clickedToken.balanceId !== "") {
        deleteToken.submit({
          balanceId: clickedToken.balanceId,
          structureId: clickedToken.structureId,
        });
      }
    });
  });

  return (
    <>
      <div class="grid grid-rows-[auto_auto] overflow-auto px-[40px] ">
        <div class="flex items-center justify-between py-[32px]">
          <div class="flex items-center gap-[8px] text-[24px] font-semibold">
            <h2>Portfolio Name</h2>
            <IconEdit />
          </div>
          <div class="flex items-center gap-[8px]">
            <Button
              image="/assets/icons/portfolio/dca.svg"
              text="DCA"
              class="custom-border-2"
            />
            <Button
              image="/assets/icons/portfolio/structures.svg"
              text="See All Structures"
              class="custom-border-2"
            />
            <Button
              image="/assets/icons/portfolio/add.svg"
              text="Create New Structure"
              class="bg-[#2196F3]"
              onClick$={() => {
                isCreateNewStructureModalOpen.value =
                  !isCreateNewStructureModalOpen.value;
              }}
            />
          </div>
        </div>
        <div class="grid grid-cols-[auto_auto] gap-[24px] overflow-auto pb-[145px]">
          <div class="custom-bg-white custom-border-1 flex min-h-[260px] min-w-[580px] flex-col gap-[24px] overflow-auto rounded-[16px] p-[24px] ">
            <p class="text-[20px] font-semibold">Token list</p>
            <div class="grid grid-cols-4 gap-[8px]">
              <ButtonTokenList
                image="/assets/icons/search.svg"
                text="Search for name"
                class="flex-row-reverse justify-end text-opacity-50"
              />
              <ButtonTokenList
                image="/assets/icons/arrow-down.svg"
                text="Choose Subportfolio"
                class=""
              />
              <ButtonTokenList
                image="/assets/icons/arrow-down.svg"
                text="Choose Wallet"
                class=""
              />
              <ButtonTokenList
                image="/assets/icons/arrow-down.svg"
                text="Choose Network"
                class=""
              />
            </div>
            <div class="grid grid-rows-[40px_auto] items-center gap-[24px] overflow-auto text-[14px]">
              <div
                style="grid-template-columns: minmax(200px, 400px) repeat(2, minmax(100px, 200px)) minmax(180px, 300px) repeat(2, minmax(145px, 300px)) 40px;"
                class="grid items-center text-[12px] font-normal text-white text-opacity-[50%]"
              >
                <div class="">TOKEN NAME</div>
                <div class="">QUANTITY</div>
                <div class="">VALUE</div>
                <div class="custom-bg-white custom-border-1 flex h-[32px] w-fit gap-[8px] rounded-lg p-[2px] ">
                  <button class="custom-bg-button rounded-[8px] px-[8px]">
                    24h
                  </button>
                  <button class="px-[8px]">3d</button>
                  <button class="px-[8px]">30d</button>
                </div>
                <div class="">WALLET</div>
                <div class="">NETWORK</div>
                <div class=""></div>
              </div>

              {availableStructures.value.map((createdStructures) => (
                <Group
                  key={createdStructures.structure.name}
                  createdStructure={createdStructures}
                  tokenStore={clickedToken}
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
                  class="mt-8 text-sm"
                >
                  <label for="name" class="block custom-text-50 text-xs mb-2 uppercase">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Structure name..."
                    class={`mb-4 block w-full custom-border-1 bg-transparent h-12 rounded-lg text-white px-3  placeholder:text-white ${isValidName(structureStore.name) ? "bg-red-300" : ""}`}
                    value={structureStore.name}
                    onInput$={(e) => {
                      const target = e.target as HTMLInputElement;
                      structureStore.name = target.value;
                    }}
                  />
                  {!isValidName(structureStore.name) && (
                    <p class="mb-4 text-red-500">Invalid name</p>
                  )}


                  <label for="walletsId" class="block custom-text-50 text-xs mb-2 uppercase">
                    Select Wallets
                  </label>

                  <div class="mb-3 w-full text-sm">
                    
                    {/* input Select wallet */}
                    <input id="walletCheckbox" type="checkbox" class="walletCheckbox absolute h-0 w-0 overflow-hidden"/>
                    <label for="walletCheckbox" class="walletLabel relative block h-12 w-full rounded-lg custom-border-1 bg-transparent outline-none cursor-pointer">
                      <div class="absolute start-2 top-[0.45rem] h-8 w-fit custom-bg-button rounded-[6px] px-3 py-1.5 flex gap-2">
                        <p>2 selections</p>
                        <button class="cursor-pointer">
                          <IconClose />
                        </button>
                      </div>
                      <span class="absolute end-4 cursor-pointer top-4">
                        <IconArrowDown/>
                      </span>
                    </label>
                
                    {/* div całości z opcjami */}
                    <div class="walletList flex flex-col w-full border-white border-solid border border-opacity-15 border-t-0 rounded-lg rounded-t-none px-4 py-6 gap-4 shadow-md">
                      <div class="flex justify-between items-center">
                        <p class="text-white uppercase text-xs"><span class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text font-semibold text-transparent">2 wallets</span> selected </p>
                        <label class="flex h-6 items-center gap-3">
                          <input type="checkbox" class="relative h-5 w-5 custom-bg-white appearance-none rounded custom-border-1 hover:cursor-pointer focus:after:absolute focus:after:z-[1] checked:after:absolute checked:after:mt-0.5 checked:after:ms-[0.35rem] checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-[0.1rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent"/>
                          <span class="uppercase custom-text-50 text-xs">select all</span>
                        </label>
                      </div>
                      {/* div strikte z opcjami */}
                      <div class="flex flex-col w-[98%] gap-2 max-h-[180px] overflow-auto"
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
                        {observedWalletsWithBalance.value.map((option) => (
                          <label 
                          class="custom-border-1 p-2 rounded-lg custom-bg-white min-h-9 inline-flex space-x-2 items-center cursor-pointer"
                          key={option.wallet.id}>
                            <input type="checkbox"
                            class="relative h-5 w-5 custom-bg-white appearance-none rounded custom-border-1 hover:cursor-pointer focus:after:absolute focus:after:z-[1] checked:after:absolute checked:after:mt-0.5 checked:after:ms-[0.35rem] checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-[0.1rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent"
                            value={option.wallet.id}
                            />
                            <span> 
                              {option.wallet.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <label for="balance" class="block custom-text-50 text-xs mb-2 uppercase">
                    Select Tokens
                  </label>

                  <div class="mb-3 w-full text-sm">
                    
                    {/* input Select token */}
                    <input id="tokenCheckbox" type="checkbox" class="tokenCheckbox absolute h-0 w-0 overflow-hidden"/>
                    <label for="tokenCheckbox" class="tokenLabel relative block h-12 w-full rounded-lg custom-border-1 bg-transparent outline-none cursor-pointer">
                      <span class="absolute end-4 cursor-pointer top-4">
                        <IconArrowDown/>
                      </span>
                    </label>
                
                    {/* div całości z opcjami */}
                    <div class="tokenList flex flex-col w-full border-white border-solid border border-opacity-15 border-t-0 rounded-lg rounded-t-none px-4 py-6 gap-4 shadow-md">
                      <div class="flex justify-between items-center">
                        <p class="text-white uppercase text-xs"><span class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text font-semibold text-transparent">2 tokens</span> selected </p>
                        <label class="flex h-6 items-center gap-3">
                          <input type="checkbox" class="relative h-5 w-5 custom-bg-white appearance-none rounded custom-border-1 hover:cursor-pointer focus:after:absolute focus:after:z-[1] checked:after:absolute checked:after:mt-0.5 checked:after:ms-[0.35rem] checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-[0.1rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent"/>
                          <span class="uppercase custom-text-50 text-xs">select all</span>
                        </label>
                      </div>
                      {/* div strikte z opcjami */}
                      <div class="flex flex-col w-[98%] gap-2 max-h-[180px] overflow-auto">
                          <label 
                          class="custom-border-1 p-2 rounded-lg custom-bg-white min-h-9 inline-flex space-x-2 items-center">
                            <input type="checkbox"
                            class="relative h-5 w-5 custom-bg-white appearance-none rounded custom-border-1 hover:cursor-pointer focus:after:absolute focus:after:z-[1] checked:after:absolute checked:after:mt-0.5 checked:after:ms-[0.35rem] checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-[0.1rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent"
                            />
                            <span> 
                            {parseWalletsToOptions(selectedWallets.wallets)}
                            </span>
                          </label>
                      </div>
                    </div>
                  </div>

                  {/* <select class="text-white bg-transparent custom-border-1 rounded-lg w-full px-4 mb-4 h-16" name="balancesId[]" multiple>
                    <option class="text-white flex items-center justify-between bg-transparent">Select Tokens</option>
                    
                  </select> */}


                  <div class="flex gap-4">
                    <button
                      type="submit"
                      class="custom-border-1 h-12 w-[50%] rounded-[48px] hover:scale-105 duration-300 ease-in-out"
                      disabled={!isValidName(structureStore.name)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class=" bg-blue-500 h-12 w-[50%] rounded-[48px] hover:scale-105 duration-300 ease-in-out"
                      disabled={!isValidName(structureStore.name)}
                    >
                      Add token
                    </button>
                  </div>
                </Form>
              </Modal>
            )}
          </div>
          <div class="custom-border-1 custom-bg-white flex w-[322px] flex-col gap-[24px] overflow-auto rounded-[16px] p-[24px]">
            <div class="flex h-[32px] items-center justify-between">
              <p class="text-[20px] font-semibold">Details</p>
              <Button
                image="/assets/icons/portfolio/rebalance.svg"
                text="Rebalance"
                class="custom-border-2"
              />
            </div>
            <div class="flex h-auto items-center gap-[16px]">
              <div class="custom-border-1 flex h-[44px] w-[44px] items-center justify-center rounded-[8px]">
                <IconBtc width={24} height={24} class="min-w-[24px]" />
              </div>
              <div class="flex flex-col gap-[8px]">
                <h4 class="text-[14px] font-medium">Bitcoin</h4>
                <p class="text-[12px] text-white text-opacity-50">BTC</p>
              </div>
            </div>
            <p class="text-[16px] font-medium">$82 617,96</p>
            <div class="custom-border-1  custom-bg-white grid grid-cols-4 items-center rounded-[8px] px-[4px] py-[3.5px] text-[12px] font-normal">
              <button class="custom-bg-button rounded-[6px] p-[8px]">
                Hour
              </button>
              <button class="rounded-[6px] p-[8px]">Day</button>
              <button class="rounded-[6px] p-[8px]">Month</button>
              <button class="rounded-[6px] p-[8px]">Year</button>
            </div>
            <ImgChart />
            <div class="flex flex-col gap-[16px]">
              <h4 class="text-[14px] font-medium">Market data</h4>
              <p class="text-[12px] font-thin leading-[180%]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque quis rutrum mi. Fusce elit est, condimentum eget
                various et, tempor in erat. Fusce vulputate faucibus arcu id
                molestie. Sed auctor tortor eu arcu feugiat, ut placerat nisl
                convallis. Pellentesque sodales congue vulputate. Aliquam erat
                volutpat. Fusce convallis sit amet dui at gravida. Aliquam a
                elit nec justo gravida tristique. Praesent non semper felis.
                Mauris ornare, purus vel luctus aliquam, erat lorem placerat
                sem, posuere condimentum dolor justo convallis leo.
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
