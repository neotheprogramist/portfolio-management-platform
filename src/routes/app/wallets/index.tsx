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
import { contractABI, publicClient } from "~/abi/abi";
import { type Wallet } from "~/interface/auth/Wallet";
import { connectToDB } from "~/utils/db";
import { chainIdToNetworkName } from "~/utils/chains";
import { Modal } from "~/components/modal";
import { SelectedWalletDetails } from "~/components/wallets/details";
import { ObservedWallet } from "~/components/wallets/observed";
import { type Token } from "~/interface/token/Token";
import { type Balance } from "~/interface/balance/Balance";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { formatTokenBalance } from "~/utils/formatBalances/formatTokenBalance";
import { isAddress } from "viem";
// import ImgSearch from "/public/images/svg/search.svg?jsx";
// import ImgSearch from "../../../../../public/images/svg/search.svg?jsx";
import ImgArrowDown from '/public/images/arrowDown.svg?jsx';
import ImgI from '/public/images/svg/i.svg?jsx';

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
      walletId = createWalletQueryResult.id;
      // native balance for created wallet
      const nativeBalance = await publicClient.getBalance({
        address: createWalletQueryResult.address as `0x${string}`,
        blockTag: "safe",
      });
      await db.query(
        `UPDATE ${walletId} SET nativeBalance = '${nativeBalance}';`,
      );

      // create balances for tokens
      const tokens = await db.select<Token>("token");
      for (const token of tokens) {
        // for each token create balance
        const readBalance = await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: contractABI,
          functionName: "balanceOf",
          args: [createWalletQueryResult.address as `0x${string}`],
        });
        const [balance] = await db.create<Balance>(`balance`, {
          value: readBalance.toString(),
        });
        // balance -> token && balance -> wallet
        await db.query(`RELATE ONLY ${balance.id}->for_token->${token.id}`);
        await db.query(
          `RELATE ONLY ${balance.id}->for_wallet->${createWalletQueryResult.id}`,
        );
      }
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

  const [result]: any = await db.query(
    `SELECT ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");
  const observedWalletsQueryResult = result[0]["->observes_wallet"].out;

  const observedWallets: any[] = [];
  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);
    const nativeBalance = await publicClient.getBalance({
      address: wallet.address as `0x${string}`,
      blockTag: "safe",
    });
    await db.query(
      `UPDATE ${observedWallet} SET nativeBalance = '${nativeBalance}';`,
    );

    const walletTokensBalances: WalletTokensBalances = {
      wallet: {
        id: wallet.id,
        name: wallet.name,
        chainId: wallet.chainId,
        address: wallet.address,
        nativeBalance: nativeBalance,
      },
      tokens: [],
    };

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      // Certain balance which shall be updated
      const [[balanceToUpdate]]: any = await db.query(
        `SELECT * FROM balance WHERE ->(for_wallet WHERE out = '${wallet.id}') AND ->(for_token WHERE out = '${token.id}');`,
      );

      await db.update<Balance>(`${balanceToUpdate.id}`, {
        value: readBalance.toString(),
      });

      const formattedBalance = formatTokenBalance(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        // Add the token to the wallet object
        walletTokensBalances.tokens.push({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
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
    <div class="grid w-full grid-cols-[24%_75%] gap-4 p-8 grid-rows-[14%_85%] z-10">
      <div class="flex flex-col overflow-auto bg-glass border-white-opacity-20 rounded-xl p-6 gap-6 row-span-2">
        <div class="flex justify-between text-white items-center">
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
        <div class="flex flex-col gap-2">
          <button class="cursor-pointer border-white-opacity-20 rounded-lg px-3 py-2 text-white text-opacity-50 text-xs bg-glass flex items-center gap-2">
            {/* <ImgSearch/> */}
            Search for wallet</button>
          <button class="cursor-pointer border-white-opacity-20 rounded-lg px-3 py-2 text-white text-xs bg-glass flex items-center justify-between">
            Choose Network
          <ImgArrowDown/></button>
        </div>

        <div class="flex flex-col">
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

      <div class="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-xl p-6 gap-6 row-span-1 flex items-center justify-between">
            <div class="text-white">
                <h2 class="flex items-center gap-2 text-sm mb-4">
                  <ImgI/> Pending authorization</h2>
                <p class="text-xs">This wallet requires authorization. Click Authorize to log in using this wallet and approve all associated tokens.</p>
            </div>
            <div>
              <button class="cursor-pointer border-buttons rounded-3xl px-3.5 py-1.5 font-semibold text-white text-xs mr-2">Dismiss</button>
              <button class="border-none bg-blue-500 rounded-3xl px-4 py-2 font-semibold text-white text-xs">Authorize</button>
            </div>
      </div> 

      <div class="flex flex-col overflow-auto bg-glass border-white-opacity-20 rounded-xl p-6 gap-6 row-span-1">
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
        <Modal isOpen={isAddWalletModalOpen} title="Add Wallet">
          <Form
            action={addWalletAction}
            onSubmitCompleted$={() => {
              if (addWalletAction.value?.success) {
                isAddWalletModalOpen.value = false;
              }
            }}
            class="p-5"
          >
            <div class="mb-5">
              <p  class="text-white text-xs pb-1">Type</p>
              <div class="bg-glass border-white-opacity-20 p-1 rounded grid grid-cols-[50%_50%]">
                <button class="color-gradient p-2.5 rounded col-span-1 text-white">Executable</button>
                <button class="col-span-1 text-white">Read-only</button>
              </div>
            </div>
            <label for="name" class="flex text-white text-xs pb-1 gap-2">
              Name
              {!isValidName(addWalletFormStore.name) && (
              <span class="text-red-500 text-xs">Invalid name</span>
            )}
            </label>
            <input
              type="text"
              name="name"
              class={`mb-5 block w-[80%] bg-transparent border-white-opacity-20 p-3 rounded text-white 
              ${!isValidName(addWalletFormStore.name) ? "text-red-500" : ""}`}
              value={addWalletFormStore.name}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                addWalletFormStore.name = target.value;
              }}
            />
            <label for="address" class="flex text-white text-xs pb-1 gap-2">
              Address             
              {!isValidAddress(addWalletFormStore.address) && (
              <span class=" text-red-500 text-xs">Invalid address</span>
            )}
            </label>
            <input
              type="text"
              name="address"
              class={`mb-5 block w-[80%] bg-transparent border-white-opacity-20 p-3 text-white rounded 
              ${!isValidAddress(addWalletFormStore.address) ? "bg-red-300" : ""}`}
              value={addWalletFormStore.address}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                addWalletFormStore.address = target.value;
              }}
            />

            <label for="network" class="block text-white text-xs pb-1">
              Network
            </label>
            <input
              type="text"
              name="network"
              class={`mb-5 block w-full bg-transparent border-white-opacity-20 p-3 rounded placeholder-white placeholder-opacity-50 text-sm`}
              // value={addWalletFormStore.address}
              // onInput$={(e) => {
              //   const target = e.target as HTMLInputElement;
              //   addWalletFormStore.address = target.value;
              // }}
              placeholder="Select network" 
            />
            <button
              type="reset"
              class="absolute bottom-5 right-36 text-white font-normal border-buttons p-3 rounded-3xl"
              disabled={
                !isValidName(addWalletFormStore.name) ||
                !isValidAddress(addWalletFormStore.address)
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              class="absolute bottom-5 right-4 text-white font-normal color-gradient p-0.5 rounded-3xl"
              disabled={
                !isValidName(addWalletFormStore.name) ||
                !isValidAddress(addWalletFormStore.address)
              }
            >
              <p class="p-3 bg-black rounded-3xl">Add wallet</p>
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
            class="bg-red-500 text-white font-normal  p-3 rounded-3xl text-center absolute bottom-5 right-4"
          >
            Confirm Delete
          </button>
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
