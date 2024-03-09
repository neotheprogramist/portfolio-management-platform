import { component$, useSignal, useStore } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  zod$,
  z,
  routeLoader$,
} from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { type RawQueryResult } from "surrealdb.js/script/types";
import { publicClient } from "~/abi/abi";
import { type Wallet } from "~/interface/auth/Wallet";
import { connectToDB } from "~/utils/db";
import { chainIdToNetworkName } from "~/utils/chains";
import { Modal } from "~/components/modal";
import { SelectedWalletDetails } from "~/components/wallets/details";
import { ObservedWallet } from "~/components/wallets/observed";
import { type Balance } from "~/interface/balance/Balance";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { formatTokenBalance } from "~/utils/formatBalances/formatTokenBalance";
import { isAddress, getAddress } from "viem";
import ImgArrowDown from "/public/images/arrowDown.svg?jsx";
import ImgI from "/public/images/svg/i.svg?jsx";
import {
  fetchSubgraphAccountsData,
  fetchSubgraphOneAccount,
} from "~/utils/subgraph/fetch";
import { isValidName, isValidAddress } from "~/utils/validators/addWallet";

export const useAddWallet = routeAction$(
  async (data, requestEvent) => {
    const db = await connectToDB(requestEvent.env);
    await db.query(
      `DEFINE INDEX walletAddressChainIndex ON TABLE wallet COLUMNS address, chainId UNIQUE;`,
    );

    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;

    const existingWallet = await db.query(
      `SELECT * FROM wallet WHERE address = type::string($addr);`,
      { addr: data.address },
    );

    let walletId;
    if (
      existingWallet[0] &&
      Array.isArray(existingWallet[0]) &&
      existingWallet[0][0]
    ) {
      const wallet = existingWallet[0][0] as Wallet;
      walletId = wallet.id;
    } else {
      const [createWalletQueryResult] = await db.create<Wallet>("wallet", {
        chainId: 1,
        address: data.address,
        name: data.name,
      });
      console.log("created wallet", createWalletQueryResult);
      walletId = createWalletQueryResult.id;
      // native balance for created wallet
      const nativeBalance = await publicClient.getBalance({
        address: createWalletQueryResult.address as `0x${string}`,
        blockTag: "safe",
      });
      await db.query(
        `UPDATE ${walletId} SET nativeBalance = '${nativeBalance}';`,
      );

      const subgraphURL = requestEvent.env.get("SUBGRAPH_URL");
      if (!subgraphURL) {
        throw new Error("Missing SUBGRAPH_URL");
      }

      const account_ = await fetchSubgraphOneAccount(
        data.address.toLowerCase(),
        subgraphURL,
      );

      account_.balances.forEach(async (bal: any) => {
        const [balance] = await db.create<Balance>("balance", {
          value: bal.amount,
        });

        const [[token]]: any = await db.query(
          `SELECT id FROM token where address = '${getAddress(bal.token.id)}'`,
        );

        await db.query(`RELATE ONLY ${balance.id}->for_token->${token.id}`);

        await db.query(
          `RELATE ONLY ${balance.id}->for_wallet->${createWalletQueryResult.id}`,
        );
      });
    }

    const [existingRelation] = await db.query(
      `SELECT * FROM ${userId}->observes_wallet WHERE out = ${walletId};`,
    );

    if ((existingRelation as RawQueryResult[]).length === 0) {
      await db.query(`RELATE ONLY ${userId}->observes_wallet->${walletId};`);
    }

    return {
      success: true,
      wallet: { id: walletId, chainId: 1, address: data.address },
    };
  },
  zod$({
    address: z.string().refine((address) => isAddress(address), {
      message: "Invalid address",
    }),
    name: z.string(),
  }),
);

export const useRemoveWallet = routeAction$(
  async (wallet, requestEvent) => {
    const db = await connectToDB(requestEvent.env);

    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }

    const walletToRemove = await db.select<Wallet>(`${wallet.id}`);

    if (!walletToRemove[0]) {
      return { success: false, error: "Wallet does not exist" };
    }

    const { userId } = jwt.decode(cookie.value) as JwtPayload;
    await db.query(`DELETE ${userId}->observes_wallet WHERE out=${wallet.id};`);

    const [[usersObservingWallet]]: any = await db.query(
      `SELECT <-observes_wallet.in FROM ${wallet.id};`,
    );

    if (!usersObservingWallet["<-observes_wallet"].in.length) {
      await db.delete(`${wallet.id}`);
    }

    return { success: true };
  },
  zod$({
    id: z.string(),
  }),
);

export const useObservedWallets = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [[resultAddresses]]: any = await db.query(
    `SELECT ->observes_wallet.out.address FROM ${userId};`,
  );
  if (!resultAddresses) return [];
  const observedWalletsAddressesQueryResult =
    resultAddresses["->observes_wallet"].out.address;
  if (!observedWalletsAddressesQueryResult) return [];
  const subgraphURL = requestEvent.env.get("SUBGRAPH_URL");
  if (!subgraphURL) {
    throw new Error("Missing SUBGRAPH_URL");
  }

  const accounts_ = await fetchSubgraphAccountsData(
    observedWalletsAddressesQueryResult,
    subgraphURL,
  );

  const observedWallets: WalletTokensBalances[] = [];

  for (const acc of accounts_) {
    const nativeBalance = await publicClient.getBalance({
      address: getAddress(acc.id) as `0x${string}`,
      blockTag: "safe",
    });
    await db.query(
      `UPDATE wallet SET nativeBalance = '${nativeBalance}' WHERE address = ${getAddress(acc.id)};`,
    );

    const [[walletDetails]]: any = await db.query(
      `SELECT id, name, chainId FROM wallet WHERE address = '${getAddress(acc.id)}';`,
    );

    if (!walletDetails) return [];

    const walletTokensBalances: WalletTokensBalances = {
      wallet: {
        id: walletDetails.id,
        name: walletDetails.name,
        chainId: walletDetails.chainId,
        address: getAddress(acc.id),
        nativeBalance: nativeBalance,
      },
      tokens: [],
    };

    for (const bal of acc.balances) {
      const [[balanceToUpdate]]: any = await db.query(
        `SELECT * FROM balance WHERE ->(for_wallet WHERE out.address = '${getAddress(acc.id)}') AND ->(for_token WHERE out.address = '${getAddress(bal.token.id)}');`,
      );
      const [updatedBalance] = await db.update<Balance>(
        `${balanceToUpdate.id}`,
        {
          value: bal.amount.toString(),
        },
      );

      const formattedBalance = formatTokenBalance(
        updatedBalance.value.toString(),
        parseInt(bal.token.decimals),
      );

      if (
        BigInt(updatedBalance.value) !== BigInt(0) &&
        formattedBalance !== "0.000"
      ) {
        walletTokensBalances.tokens.push({
          id: bal.token.id,
          name: bal.token.name,
          symbol: bal.token.symbol,
          decimals: parseInt(bal.token.decimals),
          balance: formattedBalance,
        });
      }
    }
    observedWallets.push(walletTokensBalances);
  }
  return observedWallets;
});

export default component$(() => {
  const addWalletAction = useAddWallet();
  const removeWalletAction = useRemoveWallet();
  const observedWallets = useObservedWallets();
  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const selectedWallet = useSignal<WalletTokensBalances | null>(null);
  const addWalletFormStore = useStore({ name: "", address: "" });

  return (
    <div class="grid grid-cols-[24%_75%] grid-rows-[100px_1fr] gap-4 overflow-auto border-t border-white border-opacity-15 p-6">
      <div class="col-start-1 col-span-1 row-span-2 row-start-1 row-end-3 grid grid-rows-[52px_40px_40px_1fr] overflow-auto bg-glass border-white-opacity-20 rounded-xl p-6 gap-2 ">
        <div class="flex justify-between text-white items-center pb-4 row-start-1 row-span-1">
          <h1 class="text-xl">Wallets</h1>
          <button
            class="cursor-pointer border-buttons rounded-3xl px-4 py-2 font-semibold text-white text-xs"
            onClick$={() => {
              isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
            }}
          >
            Add New Wallet
          </button>
        </div>

        <button class="cursor-pointer border-white-opacity-20 rounded-lg px-3 py-2 text-white text-opacity-50 text-xs bg-glass flex items-center gap-2 row-start-2 row-span-1">
          <ImgSearch/>
          Search for wallet
        </button>

        <button class="cursor-pointer border-white-opacity-20 rounded-lg px-3 py-2 text-white text-xs bg-glass flex items-center justify-between row-start-3 row-span-1">
          Choose Network
        <ImgArrowDown/>
        </button>

        <div class="row-span-1 row-start-4 h-full overflow-auto">
          <div class="overflow-auto">
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
            {observedWallets.value.map((observedWallet) => (
              <ObservedWallet
                key={observedWallet.wallet.address}
                observedWallet={observedWallet}
                selectedWallet={selectedWallet}
                chainIdToNetworkName={chainIdToNetworkName}
              />
            ))}
          </div>
        </div>
      </div>

      <div class="row-span-1 flex items-center justify-between gap-6 rounded-xl border border-blue-500 bg-blue-500 bg-opacity-20 p-6">
        <div class="text-white">
          <h2 class="mb-4 flex items-center gap-2 text-sm">
            <ImgI /> Pending authorization
          </h2>
          <p class="text-xs">
            This wallet requires authorization. Click Authorize to log in using
            this wallet and approve all associated tokens.
          </p>
        </div>
        <div>
          <button class="border-buttons mr-2 cursor-pointer rounded-3xl px-3.5 py-1.5 text-xs font-semibold text-white">
            Dismiss
          </button>
          <button class="rounded-3xl border-none bg-blue-500 px-4 py-2 text-xs font-semibold text-white">
            Authorize
          </button>
        </div>
      </div>

      <div class="bg-glass border-white-opacity-20 row-span-1 flex flex-col gap-6 overflow-auto rounded-xl p-6">
        {selectedWallet.value && (
          <SelectedWalletDetails
            key={selectedWallet.value.wallet.address}
            selectedWallet={selectedWallet}
            chainIdToNetworkName={chainIdToNetworkName}
            isDeleteModalopen={isDeleteModalOpen}
          />
        )}
      </div>

      {isAddWalletModalOpen.value && (
        <Modal
          isOpen={isAddWalletModalOpen}
          formStore={addWalletFormStore}
          title="Add Wallet"
        >
          <Form
            action={addWalletAction}
            onSubmitCompleted$={() => {
              if (addWalletAction.value?.success) {
                isAddWalletModalOpen.value = false;
                addWalletFormStore.address = "";
                addWalletFormStore.name = "";
              }
            }}
            class="p-5"
          >
            <div class="mb-5">
              <p class="pb-1 text-xs text-white">Type</p>
              <div class="bg-glass border-white-opacity-20 grid grid-cols-[50%_50%] rounded p-1">
                <button type="button" class="col-span-1 text-white">
                  Executable
                </button>
                <button
                  type="button"
                  class="color-gradient col-span-1 rounded p-2.5  text-white"
                >
                  Read-only
                </button>
              </div>
            </div>
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
              ${!isValidName(addWalletFormStore.name) ? "text-red-500" : ""}`}
              value={addWalletFormStore.name}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                addWalletFormStore.name = target.value;
              }}
            />
            <label for="address" class="flex gap-2 pb-1 text-xs text-white">
              Address
              {!isValidAddress(addWalletFormStore.address) && (
                <span class=" text-xs text-red-500">Invalid address</span>
              )}
            </label>
            <input
              type="text"
              name="address"
              class={`border-white-opacity-20 mb-5 block w-[80%] rounded bg-transparent p-3 text-white 
              ${!isValidAddress(addWalletFormStore.address) ? "bg-red-300" : ""}`}
              value={addWalletFormStore.address}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                addWalletFormStore.address = target.value;
              }}
            />

            <label for="network" class="block pb-1 text-xs text-white">
              Network
            </label>
            <input
              type="text"
              name="network"
              class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
              // value={addWalletFormStore.address}
              // onInput$={(e) => {
              //   const target = e.target as HTMLInputElement;
              //   addWalletFormStore.address = target.value;
              // }}
              placeholder="Select network"
              disabled={true}
            />
            <button
              type="reset"
              class="border-buttons absolute bottom-5 right-36 rounded-3xl p-3 font-normal text-white"
              onClick$={() => {
                isAddWalletModalOpen.value = false;
                addWalletFormStore.address = "";
                addWalletFormStore.name = "";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="color-gradient absolute bottom-5 right-4 rounded-3xl p-0.5 font-normal text-white"
              disabled={
                addWalletFormStore.name === "" ||
                addWalletFormStore.address === "" ||
                !isValidName(addWalletFormStore.name) ||
                !isValidAddress(addWalletFormStore.address)
              }
            >
              <p class="rounded-3xl bg-black p-3">Add wallet</p>
            </button>

          </Form>
        </Modal>
      )}

      {isDeleteModalOpen.value && (
        <Modal isOpen={isDeleteModalOpen} title="Delete Wallet">
          <button
            onClick$={async () => {
              if (selectedWallet.value && selectedWallet.value.wallet.id) {
                await removeWalletAction.submit({
                  id: selectedWallet.value.wallet.id,
                });
                selectedWallet.value = null;
                isDeleteModalOpen.value = false;
              }
            }}
            class="absolute bottom-5 right-4  rounded-3xl bg-red-500 p-3 text-center font-normal text-white"
          >
            Confirm Delete
          </button>
        </Modal>
      )}
    </div>
  );
});
