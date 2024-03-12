import { component$, useSignal, useStore } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  zod$,
  z,
  routeLoader$,
} from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
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
import { isAddress, getAddress, checksumAddress } from "viem";
import ImgArrowDown from "/public/images/arrowDown.svg?jsx";
import ImgI from "/public/images/svg/i.svg?jsx";
import {
  fetchSubgraphAccountsData,
  fetchSubgraphOneAccount,
} from "~/utils/subgraph/fetch";
import { isValidName, isValidAddress } from "~/utils/validators/addWallet";
import {
  getUsersObservingWallet,
  walletExists,
} from "~/interface/wallets/removeWallet";
import {
  getExistingRelation,
  getExistingWallet,
  getTokenByAddress,
} from "~/interface/wallets/addWallet";
import {
  fetchTokenDayData,
  getBalanceToUpdate,
  getDBTokenPriceUSD,
  getDBTokensAddresses,
  getResultAddresses,
  getWalletDetails,
} from "~/interface/wallets/observedWallets";

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

    const existingWallet = await getExistingWallet(db, data.address);
    console.log("existingWallet", existingWallet);

    let walletId;
    if (existingWallet.at(0)) {
      console.log("wallet exists");

      walletId = existingWallet[0].id;
    } else {
      console.log("wallet does not exist");
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

        const [token] = await getTokenByAddress(db, bal.token.id);

        await db.query(`RELATE ONLY ${balance.id}->for_token->${token.id}`);

        await db.query(
          `RELATE ONLY ${balance.id}->for_wallet->${createWalletQueryResult.id}`,
        );
      });
    }

    if (!(await getExistingRelation(db, userId, walletId)).at(0)) {
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

    if (!(await walletExists(db, wallet.id))) {
      throw new Error("Wallet does not exist");
    }

    const { userId } = jwt.decode(cookie.value) as JwtPayload;
    await db.query(`DELETE ${userId}->observes_wallet WHERE out=${wallet.id};`);

    const [usersObservingWallet] = await getUsersObservingWallet(db, wallet.id);

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

  const resultAddresses = await getResultAddresses(db, userId);
  if (!resultAddresses[0]["->observes_wallet"].out.address.length) {
    return [];
  }
  const observedWalletsAddressesQueryResult =
    resultAddresses[0]["->observes_wallet"].out.address;

  const subgraphURL = requestEvent.env.get("SUBGRAPH_URL");
  if (!subgraphURL) {
    throw new Error("Missing SUBGRAPH_URL");
  }

  const accounts_ = await fetchSubgraphAccountsData(
    observedWalletsAddressesQueryResult,
    subgraphURL,
  );
  console.log("accounts_", accounts_);

  const uniswapSubgraphURL = requestEvent.env.get("UNISWAP_SUBGRAPH_URL");
  if (!uniswapSubgraphURL) {
    throw new Error("Missing UNISWAP_SUBGRAPH_URL");
  }

  const dbTokensAddresses = await getDBTokensAddresses(db);
  const tokenAddresses = dbTokensAddresses.map((token) =>
    token.address.toLowerCase(),
  );

  const tokenDayData = await fetchTokenDayData(
    uniswapSubgraphURL,
    tokenAddresses,
  );
  console.log("tokenDayData", tokenDayData);
  for (const {
    token: { id },
    priceUSD,
  } of tokenDayData) {
    console.log("update priceUsd", priceUSD);
    await db.query(`
      UPDATE token 
      SET priceUSD = '${priceUSD}'
      WHERE address = '${checksumAddress(id as `0x${string}`)}';
    `);
  }

  const observedWallets: WalletTokensBalances[] = [];

  for (const acc of accounts_) {
    console.log("acc", acc);
    const nativeBalance = await publicClient.getBalance({
      address: getAddress(acc.id) as `0x${string}`,
      blockTag: "safe",
    });

    await db.query(
      `UPDATE wallet SET nativeBalance = '${nativeBalance}' WHERE address = ${getAddress(acc.id)};`,
    );

    const walletDetails = await getWalletDetails(db, acc.id);
    if (!walletDetails.at(0)) return [];

    const walletTokensBalances: WalletTokensBalances = {
      wallet: {
        id: walletDetails[0].id,
        name: walletDetails[0].name,
        chainId: walletDetails[0].chainId,
        address: getAddress(acc.id),
        nativeBalance: nativeBalance,
      },
      tokens: [],
    };

    for (const balance of acc.balances) {
      const [balanceToUpdate] = await getBalanceToUpdate(
        db,
        acc.id,
        balance.token.id,
      );
      const [updatedBalance] = await db.update<Balance>(
        `${balanceToUpdate.id}`,
        {
          value: balance.amount.toString(),
        },
      );

      const formattedBalance = formatTokenBalance(
        updatedBalance.value.toString(),
        parseInt(balance.token.decimals),
      );

      const [{ priceUSD }] = await getDBTokenPriceUSD(db, balance.token.id);
      if (
        BigInt(updatedBalance.value) !== BigInt(0) &&
        formattedBalance !== "0.000"
      ) {
        walletTokensBalances.tokens.push({
          id: balance.token.id,
          name: balance.token.name,
          symbol: balance.token.symbol,
          decimals: parseInt(balance.token.decimals),
          balance: formattedBalance,
          balanceValueUSD: (
            Number(formattedBalance) * Number(priceUSD)
          ).toFixed(2),
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
      <div class="bg-glass border-white-opacity-20 col-span-1 col-start-1 row-span-2 row-start-1 row-end-3 grid grid-rows-[52px_40px_40px_1fr] gap-2 overflow-auto rounded-xl p-6 ">
        <div class="row-span-1 row-start-1 flex items-center justify-between pb-4 text-white">
          <h1 class="text-xl">Wallets</h1>
          <button
            class="border-buttons cursor-pointer rounded-3xl px-4 py-2 text-xs font-semibold text-white"
            onClick$={() => {
              isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
            }}
          >
            Add New Wallet
          </button>
        </div>

        <button class="border-white-opacity-20 bg-glass row-span-1 row-start-2 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs text-white text-opacity-50">
          {/* <ImgSearch/> */}
          Search for wallet
        </button>

        <button class="border-white-opacity-20 bg-glass row-span-1 row-start-3 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs text-white">
          Choose Network
          <ImgArrowDown />
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
