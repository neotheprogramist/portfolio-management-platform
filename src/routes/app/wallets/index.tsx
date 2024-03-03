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
    <div class="grid h-screen w-full grid-cols-2 gap-4 p-8">
      <div class="max-h-600 flex flex-col overflow-auto p-2">
        <div class="flex justify-between">
          <span>Wallets</span>
          <button
            class="cursor-pointer rounded bg-blue-500 p-2 text-white"
            onClick$={() => {
              isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
            }}
          >
            Add new
          </button>
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

      <div class="max-h-600 flex flex-col overflow-auto p-2">
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
            class="mt-4"
          >
            <label for="name" class="block">
              Name
            </label>
            <input
              type="text"
              name="name"
              class={`mb-1 block w-full ${!isValidName(addWalletFormStore.name) ? "bg-red-300" : ""}`}
              value={addWalletFormStore.name}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                addWalletFormStore.name = target.value;
              }}
            />
            {!isValidName(addWalletFormStore.name) && (
              <p class="mb-4 text-red-500">Invalid name</p>
            )}
            <label for="address" class="block">
              Address
            </label>
            <input
              type="text"
              name="address"
              class={`mb-1 block w-full ${!isValidAddress(addWalletFormStore.address) ? "bg-red-300" : ""}`}
              value={addWalletFormStore.address}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                addWalletFormStore.address = target.value;
              }}
            />
            {!isValidAddress(addWalletFormStore.address) && (
              <p class="mb-4 text-red-500">Invalid address</p>
            )}
            <button
              type="submit"
              class="absolute bottom-4 right-4"
              disabled={
                !isValidName(addWalletFormStore.name) ||
                !isValidAddress(addWalletFormStore.address)
              }
            >
              Add wallet
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
            class="cursor-pointer rounded bg-red-500 p-2 text-white"
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
