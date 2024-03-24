import { component$, useSignal, useStore } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  zod$,
  z,
  routeLoader$,
} from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { contractABI, publicClient } from "~/abi/abi";
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
import ImgSearch from "/public/images/svg/search.svg?jsx";
import {
  fetchSubgraphAccountsData,
  fetchSubgraphOneAccount,
} from "~/utils/subgraph/fetch";
import {
  isValidName,
  isValidAddress,
  isCheckSum,
} from "~/utils/validators/addWallet";
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
  getTokenImagePath,
  getWalletDetails,
} from "~/interface/wallets/observedWallets";
import { watchAccount } from "@wagmi/core";
import { mainnet } from "viem/chains";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
import { emethContractAbi } from "~/abi/emethContractAbi";
import { testAccount, testPublicClient, testWalletClient } from "./testconfig";
import { usdtAbi } from "~/abi/usdtAbi";

export const useAddWallet = routeAction$(
  async (data, requestEvent) => {
    // const modalStore = useContext(ModalStoreContext);
    const db = await connectToDB(requestEvent.env);
    await db.query(
      `DEFINE INDEX walletAddressChainIndex ON TABLE wallet COLUMNS address, chainId UNIQUE;`,
    );

    const cookie = requestEvent.cookie.get("accessToken");
    if (!cookie) {
      throw new Error("No cookie found");
    }
    const { userId } = jwt.decode(cookie.value) as JwtPayload;
    console.log("USERID", userId);

    const existingWallet = await getExistingWallet(db, data.address);

    let walletId;
    if (existingWallet.at(0)) {
      walletId = existingWallet[0].id;
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

      const subgraphURL = requestEvent.env.get("SUBGRAPH_URL");
      if (!subgraphURL) {
        throw new Error("Missing SUBGRAPH_URL");
      }

      const account_ = await fetchSubgraphOneAccount(
        data.address.toLowerCase(),
        subgraphURL,
      );

      for (const bal of account_.balances) {
        const [balance] = await db.create<Balance>("balance", {
          value: bal.amount,
        });

        // TODO: just checking nonce, could be removed
        console.log("====================================");
        const nonce = await testPublicClient.getTransactionCount(testAccount);
        console.log("nonce", nonce);

        const { request } = await testPublicClient.simulateContract({
          account: testAccount,
          address: checksumAddress(bal.token.id as `0x${string}`),
          abi: bal.token.symbol === "USDT" ? usdtAbi : contractABI,
          functionName: "approve",
          args: ["0x075FbeB3802AfdCDe6DDEB1d807E4805ed719eca", 0n],
        });
        console.log(await testWalletClient.writeContract(request));

        const [token] = await getTokenByAddress(db, bal.token.id);

        await db.query(`RELATE ONLY ${balance.id}->for_token->${token.id}`);

        await db.query(
          `RELATE ONLY ${balance.id}->for_wallet->${createWalletQueryResult.id}`,
        );
      }
      // approving logged in user by observed wallet
      const eCAbi: any = emethContractAbi;
      const { address } = jwt.decode(cookie.value) as JwtPayload;
      console.log("logged in user address", address);
      const { request: secondRequest } =
        await testPublicClient.simulateContract({
          account: testAccount,
          address: "0x075FbeB3802AfdCDe6DDEB1d807E4805ed719eca",
          abi: eCAbi,
          functionName: "approve",
          args: [address],
        });
      console.log("simulate approve our contract passed");
      console.log("====================================");
      console.log(await testWalletClient.writeContract(secondRequest));
      console.log("approved logged in user by observed wallet");
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
      await db.query(`
        BEGIN TRANSACTION;
        FOR $balance IN (SELECT VALUE in FROM for_wallet WHERE out = ${wallet.id}) {
          DELETE balance WHERE id = $balance.id};
        DELETE wallet WHERE id = ${wallet.id};
        COMMIT TRANSACTION`);
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

  const uniswapSubgraphURL = requestEvent.env.get(
    "UNIV3_OPTIMIST_SUBGRAPH_URL",
  );
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
  for (const {
    token: { id },
    priceUSD,
  } of tokenDayData) {
    await db.query(`
      UPDATE token
      SET priceUSD = '${priceUSD}'
      WHERE address = '${checksumAddress(id as `0x${string}`)}';
    `);
  }
  const observedWallets: WalletTokensBalances[] = [];
  for (const acc of accounts_) {
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
        const [imagePath] = await getTokenImagePath(db, balance.token.symbol);
        walletTokensBalances.tokens.push({
          id: balance.token.id,
          name: balance.token.name,
          symbol: balance.token.symbol,
          decimals: parseInt(balance.token.decimals),
          balance: formattedBalance,
          imagePath: imagePath.imagePath,
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
    <div class="grid grid-cols-[24%_73%] grid-rows-[14%_1fr] gap-[24px] overflow-auto border-t border-white border-opacity-15 p-[24px]">
      <div class="custom-bg-white custom-border-1 col-span-1 col-start-1 row-span-2 row-start-1 row-end-3 grid grid-rows-[56px_48px_64px_1fr] overflow-auto rounded-[16px] p-[24px]">
        <div class="row-span-1 row-start-1 mb-[24px] flex items-center justify-between gap-[10px] text-white">
          <h1 class="text-xl">Wallets</h1>
          <button
            class="custom-border-2 h-[32px] cursor-pointer rounded-[40px] px-4 text-xs font-semibold leading-none text-white duration-300 ease-in-out hover:scale-110 lg:text-[10px]"
            onClick$={() => {
              isAddWalletModalOpen.value = !isAddWalletModalOpen.value;
            }}
          >
            Add New Wallet
          </button>
          <button
            onClick$={async () => {
              const metadata_test = {
                name: "Web3Modal",
                description: "Web3Modal Example",
                url: "https://web3modal.com",
                icons: ["https://avatars.githubusercontent.com/u/37784886"],
              };

              const config_test = defaultWagmiConfig({
                chains: [mainnet],
                projectId: "26aebf5aa6f44cc2a8f74e674e0617b9",
                metadata: metadata_test,
                enableWalletConnect: true,
                enableInjected: false,
                enableEIP6963: true,
                enableCoinbase: true,
              });

              // reconnect(config_test);
              const modal_test = createWeb3Modal({
                wagmiConfig: config_test,
                projectId: "26aebf5aa6f44cc2a8f74e674e0617b9",
                enableAnalytics: true,
              });

              await modal_test.open();
              watchAccount(config_test, {
                onChange(data) {
                  console.log("Account change", data);
                },
              });
            }}
          >
            test
          </button>
        </div>

        <button class="custom-border-1 custom-bg-white custom-text-50 row-span-1 row-start-2 mb-[8px] flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs">
          <ImgSearch />
          Search for wallet
        </button>

        <button class="custom-border-1 custom-bg-white row-span-1 row-start-3 mb-[24px] flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs text-white">
          Choose Network
          <ImgArrowDown />
        </button>

        <div class="row-span-1 row-start-4 h-full overflow-auto">
          <div class="flex flex-col gap-[20px] overflow-auto">
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

      <div class="row-span-1 flex items-center justify-between gap-[24px] rounded-[16px] border border-blue-500 bg-blue-500 bg-opacity-20 p-[24px]">
        <div class="">
          <h2 class="mb-[16px] flex items-center gap-2 text-sm">
            <ImgI /> Pending authorization
          </h2>
          <p class="text-xs">
            This wallet requires authorization. Click Authorize to log in using
            this wallet and approve all associated tokens.
          </p>
        </div>
        <div class="lg:flex lg:gap-[8px]">
          <button class="custom-border-2 mr-[12px] h-[32px] cursor-pointer rounded-3xl px-[16px] text-xs font-semibold text-white duration-300 ease-in-out hover:scale-110">
            Dismiss
          </button>
          <button class="h-[32px] rounded-3xl border-none bg-blue-500 px-[16px] text-xs font-semibold text-white duration-300 ease-in-out hover:scale-110">
            Authorize
          </button>
        </div>
      </div>

      <div class="custom-bg-white custom-border-1 row-span-1 flex flex-col gap-[24px] overflow-auto rounded-[16px] p-[24px]">
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
            class="p-[24px]"
          >
            <div class="mb-5">
              <p class="pb-1 text-xs text-white">Type</p>
              <div class="custom-bg-white custom-border-1 grid grid-cols-[50%_50%] rounded p-1">
                <button type="button" class="col-span-1 text-white">
                  Executable
                </button>
                <button
                  type="button"
                  class="custom-bg-button col-span-1 rounded p-2.5  text-white"
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
              class={`custom-border-1 mb-5 block w-[80%] rounded bg-transparent p-3 text-white
              ${!isValidName(addWalletFormStore.name) ? "border-red-700" : ""}`}
              value={addWalletFormStore.name}
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                addWalletFormStore.name = target.value;
              }}
            />
            <label for="address" class="flex gap-2 pb-1 text-xs text-white">
              Address
              {!isValidAddress(addWalletFormStore.address) ? (
                <span class=" text-xs text-red-500">Invalid address</span>
              ) : !isCheckSum(addWalletFormStore.address) ? (
                <span class=" text-xs text-red-500">
                  Convert your address to the check sum before submitting.
                </span>
              ) : null}
            </label>
            <div class="mb-5 flex items-center gap-2">
              <input
                type="text"
                name="address"
                class={`custom-border-1  block w-[80%] rounded bg-transparent p-3 text-white
                ${!isValidAddress(addWalletFormStore.address) ? "border-red-700" : ""}`}
                value={addWalletFormStore.address}
                onInput$={(e) => {
                  const target = e.target as HTMLInputElement;
                  addWalletFormStore.address = target.value;
                }}
              />
              {isValidAddress(addWalletFormStore.address) &&
              !isCheckSum(addWalletFormStore.address) ? (
                <button
                  class="custom-border-2 h-[32px] rounded-3xl px-[8px] text-xs font-normal text-white duration-300 ease-in-out hover:scale-110"
                  type="button"
                  onClick$={() => {
                    addWalletFormStore.address = getAddress(
                      addWalletFormStore.address,
                    );
                  }}
                >
                  Convert
                </button>
              ) : null}
            </div>
            <label for="network" class="block pb-1 text-xs text-white">
              Network
            </label>
            <input
              type="text"
              name="network"
              class={`custom-border-1 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
              placeholder="Select network"
              disabled={true}
            />
            <button
              type="reset"
              class="custom-border-2 absolute bottom-[20px] right-[120px] h-[32px] rounded-3xl px-[8px] text-xs font-normal text-white duration-300 ease-in-out hover:scale-110"
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
              class="custom-bg-button absolute bottom-[20px] right-[24px] h-[32px] rounded-3xl p-[1px] font-normal text-white duration-300 ease-in-out hover:scale-110 disabled:scale-100"
              disabled={
                addWalletFormStore.name === "" ||
                addWalletFormStore.address === "" ||
                !isValidName(addWalletFormStore.name) ||
                !isValidAddress(addWalletFormStore.address)
              }
            >
              <p
                class={`rounded-3xl px-[8px] py-[7px] text-xs ${
                  addWalletFormStore.name === "" ||
                  addWalletFormStore.address === "" ||
                  !isValidName(addWalletFormStore.name) ||
                  !isValidAddress(addWalletFormStore.address)
                    ? "bg-modal-button text-gray-400"
                    : "bg-black"
                }`}
              >
                Add wallet
              </p>
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
            class="absolute bottom-[20px] right-[24px] h-[32px] rounded-3xl bg-red-500 px-[8px] text-center text-xs text-white duration-300 ease-in-out hover:scale-110"
          >
            Confirm Delete
          </button>
        </Modal>
      )}
    </div>
  );
});
