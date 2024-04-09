import {
  $,
  component$,
  type NoSerialize,
  useContext,
  useSignal,
  useStore,
  noSerialize,
} from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  zod$,
  z,
  routeLoader$,
  server$,
} from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { contractABI } from "~/abi/abi";
import { type Wallet } from "~/interface/auth/Wallet";
import { connectToDB } from "~/utils/db";
import { chainIdToNetworkName } from "~/utils/chains";
import { Modal } from "~/components/modal";
import { SelectedWalletDetails } from "~/components/wallets/details";
import { ObservedWallet } from "~/components/wallets/observed";
import { type Balance } from "~/interface/balance/Balance";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { isAddress, checksumAddress } from "viem";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import IconInfo from "/public/assets/icons/info-blue.svg?jsx";
import IconSearch from "/public/assets/icons/search.svg?jsx";
import { isValidName, isValidAddress } from "~/utils/validators/addWallet";
import {
  getUsersObservingWallet,
  walletExists,
} from "~/interface/wallets/removeWallet";
import {
  getExistingRelation,
  getExistingWallet,
} from "~/interface/wallets/addWallet";
import {
  fetchTokenDayData,
  getDBTokenPriceUSD,
  getDBTokensAddresses,
  getTokenImagePath,
} from "~/interface/wallets/observedWallets";
import { emethContractAbi } from "~/abi/emethContractAbi";
import IsExecutableSwitch from "~/components/forms/addWallet/isExecutableSwitch";
import { getCookie } from "~/utils/refresh";
import * as jwtDecode from "jwt-decode";
import { type Token } from "~/interface/token/Token";
import { testPublicClient } from "./testconfig";
import Moralis from "moralis";
import { StreamStoreContext } from "~/interface/streamStore/streamStore";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { messagesContext } from "../layout";
import { type Chain, sepolia } from "viem/chains";
import {
  getAccount,
  simulateContract,
  watchAccount,
  writeContract,
  type Config,
  readContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { returnWeb3ModalAndClient } from "~/components/wallet-connect";
import AddWalletFormFields from "~/components/forms/addWallet/addWalletFormFields";

export const useAddWallet = routeAction$(
  async (data, requestEvent) => {
    console.log("data", data);
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

    const existingWallet = await getExistingWallet(db, data.address.toString());

    let walletId;
    if (existingWallet.at(0)) {
      walletId = existingWallet[0].id;
    } else {
      const [createWalletQueryResult] = await db.create<Wallet>("wallet", {
        chainId: 1,
        address: data.address.toString(),
        name: data.name.toString(),
      });
      walletId = createWalletQueryResult.id;
      const nativeBalance = await testPublicClient.getBalance({
        address: createWalletQueryResult.address as `0x${string}`,
      });
      await db.query(
        `UPDATE ${walletId} SET nativeBalance = '${nativeBalance}';`,
      );

      // create balances for tokens
      const tokens = await db.select<Token>("token");
      for (const token of tokens) {
        const readBalance = await testPublicClient.readContract({
          address: token.address as `0x${string}`,
          abi: contractABI,
          functionName: "balanceOf",
          args: [createWalletQueryResult.address as `0x${string}`],
        });
        if (readBalance < 0) {
          continue;
        }
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

    if (!(await getExistingRelation(db, userId, walletId)).at(0)) {
      await db.query(`RELATE ONLY ${userId}->observes_wallet->${walletId};`);
    }

    const streams = await Moralis.Streams.getAll({
      limit: 100,
    });
    console.log("add wallet streams", streams["jsonResponse"]["result"]);

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
    isExecutable: z.string(),
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

  const [result]: any = await db.query(
    `SELECT ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");
  const observedWalletsQueryResult = result[0]["->observes_wallet"].out;

  const observedWallets: WalletTokensBalances[] = [];
  console.log("looping observed wallets...");
  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);
    const nativeBalance = await testPublicClient.getBalance({
      address: wallet.address as `0x${string}`,
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
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      const emethContractAddress = requestEvent.env.get(
        "PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA",
      );
      if (!emethContractAddress) {
        throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
      }

      const allowance = await testPublicClient.readContract({
        account: wallet.address as `0x${string}`,
        address: checksumAddress(token.address as `0x${string}`),
        abi: contractABI,
        functionName: "allowance",
        args: [
          wallet.address as `0x${string}`,
          emethContractAddress as `0x${string}`,
        ],
      });

      const formattedAllowance = convertWeiToQuantity(
        allowance.toString(),
        token.decimals,
      );
      // Certain balance which shall be updated
      const [[balanceToUpdate]]: any = await db.query(
        `SELECT * FROM balance WHERE ->(for_wallet WHERE out = '${wallet.id}') AND ->(for_token WHERE out = '${token.id}');`,
      );

      await db.update<Balance>(`${balanceToUpdate.id}`, {
        value: readBalance.toString(),
      });

      const formattedBalance = convertWeiToQuantity(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        // Add the token to the wallet object
        const [{ priceUSD }] = await getDBTokenPriceUSD(db, token.address);
        console.log(priceUSD);
        const [imagePath] = await getTokenImagePath(db, token.symbol);

        walletTokensBalances.tokens.push({
          id: token.id,
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          balance: formattedBalance,
          imagePath: imagePath.imagePath,
          allowance: formattedAllowance,
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

const convertToFraction = (numericString: string) => {
  let fractionObject;
  if (!numericString.includes(".")) {
    fractionObject = {
      numerator: BigInt(numericString),
      denominator: BigInt(1),
    };
  } else {
    const fractionArray = numericString.split(".");
    fractionObject = {
      numerator: BigInt(`${fractionArray[0]}${fractionArray[1]}`),
      denominator: BigInt(Math.pow(10, fractionArray[1].length)),
    };
  }

  console.log(fractionObject);
  return fractionObject;
};

function replaceNonMatching(
  inputString: string,
  regex: RegExp,
  replacement: string,
): string {
  return inputString.replace(
    new RegExp(`[^${regex.source}]`, "g"),
    replacement,
  );
}

const chekckIfProperAmount = (input: string, regex: RegExp) => {
  return regex.test(input);
};

export interface addWalletFormStore {
  name: string;
  address: string;
  isExecutable: number;
  isNameUnique: boolean;
}

export interface transferredCoinInterface {
  symbol: string;
  address: string;
}

const fetchTokens = server$(async function () {
  const db = await connectToDB(this.env);
  return await db.select<Token>("token");
});

const addAddressToStreamConfig = server$(async function (
  streamId: string,
  address: string,
) {
  await Moralis.Streams.addAddress({ address, id: streamId });
  console.log("address added to stream config");
});

interface ModalStore {
  isConnected?: boolean;
  config?: NoSerialize<Config>;
}

export default component$(() => {
  const modalStore = useContext(ModalStoreContext);
  const formMessageProvider = useContext(messagesContext);
  const { streamId } = useContext(StreamStoreContext);
  const addWalletAction = useAddWallet();
  const removeWalletAction = useRemoveWallet();
  const observedWallets = useObservedWallets();
  const isAddWalletModalOpen = useSignal(false);
  const isDeleteModalOpen = useSignal(false);
  const transferredCoin = useStore({ symbol: "", address: "" });
  const isTransferModalOpen = useSignal(false);
  const selectedWallet = useSignal<WalletTokensBalances | null>(null);
  const addWalletFormStore = useStore<addWalletFormStore>({
    name: "",
    address: "",
    isExecutable: 0,
    isNameUnique: true,
  });
  const receivingWalletAddress = useSignal("");
  const transferredTokenAmount = useSignal("");

  const temporaryModalStore = useStore<ModalStore>({
    isConnected: false,
    config: undefined,
  });

  const setWeb3Modal = $(async () => {
    const chains: [Chain, ...Chain[]] = [sepolia];
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Missing project ID");
    }
    return returnWeb3ModalAndClient(projectId, true, true, true, chains);
  });

  const openWeb3Modal = $(async () => {
    const { config, modal } = await setWeb3Modal();
    await modal.open();
    temporaryModalStore.config = noSerialize(config);
    const { address } = getAccount(config);
    addWalletFormStore.address = address as `0x${string}`;
    watchAccount(config, {
      onChange(data) {
        console.log(data);
        temporaryModalStore.isConnected = data.isConnected;
      },
    });
  });

  const handleAddWallet = $(async () => {
    console.log("IN HANDLE ADD WALLET");
    isAddWalletModalOpen.value = false;

    formMessageProvider.messages.push({
      id: formMessageProvider.messages.length,
      variant: "info",
      message: "Processing wallet...",
      isVisible: true,
    });

    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

    try {
      if (addWalletFormStore.isExecutable) {
        if (temporaryModalStore.isConnected && temporaryModalStore.config) {
          const account = getAccount(temporaryModalStore.config);
          console.log("IN EXECUTABLE BLOCK");
          console.log("[address]: ", account.address);

          addWalletFormStore.address = account.address as `0x${string}`;

          if (!emethContractAddress) {
            throw new Error("Missing PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA");
          }

          const tokens: any = await fetchTokens();

          for (const token of tokens) {
            console.log(`Trying ${token.symbol}...`);

            const tokenBalance = await readContract(
              temporaryModalStore.config,
              {
                account: account.address as `0x${string}`,
                abi: contractABI,
                address: checksumAddress(token.address as `0x${string}`),
                functionName: "balanceOf",
                args: [account.address as `0x${string}`],
              },
            );

            console.log(`[Balance of ${token.symbol}]: `, tokenBalance);

            if (tokenBalance) {
              const approval = await simulateContract(
                temporaryModalStore.config,
                {
                  account: account.address as `0x${string}`,
                  abi: contractABI,
                  address: checksumAddress(token.address as `0x${string}`),
                  functionName: "approve",
                  args: [emethContractAddress, 10n * 10n ** 18n],
                },
              );
              console.log("[requescior simulate]: ", approval.request);
              // keep receipts for now, to use waitForTransactionReceipt
              try {
                const receipt = await writeContract(
                  temporaryModalStore.config,
                  approval.request,
                );

                console.log(
                  `Contract for ${token.symbol} has been written... `,
                  receipt,
                );
              } catch (err) {
                console.log("Errorek: ", err);
              }
            }

            const allowance = await readContract(temporaryModalStore.config, {
              account: account.address,
              address: checksumAddress(token.address as `0x${string}`),
              abi: contractABI,
              functionName: "allowance",
              args: [account.address as `0x${string}`, emethContractAddress],
            });

            console.log(`checking allowance for ${token.symbol}: ${allowance}`);
          }
        }
        // approving logged in user by observed wallet by emeth contract
        const cookie = getCookie("accessToken");
        if (!cookie) throw new Error("No accessToken cookie found");

        const { address } = jwtDecode.jwtDecode(cookie) as JwtPayload;

        const { request } = await simulateContract(
          temporaryModalStore.config as Config,
          {
            account: addWalletFormStore.address as `0x${string}`,
            address: emethContractAddress,
            abi: emethContractAbi,
            functionName: "approve",
            args: [address as `0x${string}`],
          },
        );

        const receipt = await writeContract(
          temporaryModalStore.config as Config,
          request,
        );
        console.log(receipt);
      }

      await addWalletAction.submit({
        address: addWalletFormStore.address as `0x${string}`,
        name: addWalletFormStore.name,
        isExecutable: addWalletFormStore.isExecutable.toString(),
      });

      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "success",
        message: "Wallet successfully added.",
        isVisible: true,
      });

      console.log("wallet added successfully, adding address to stream...");
      await addAddressToStreamConfig(
        streamId,
        addWalletFormStore.address as `0x${string}`,
      );
      // addWalletFormStore.address = "";
      // addWalletFormStore.name = "";
      // addWalletFormStore.privateKey = "";
      // addWalletFormStore.isExecutable = 0;
    } catch (err) {
      console.log("[big error]: ", err);
      formMessageProvider.messages.push({
        id: formMessageProvider.messages.length,
        variant: "error",
        message: "Something went wrong.",
        isVisible: true,
      });
    }
  });

  const handleTransfer = $(async () => {
    if (!selectedWallet.value || !modalStore.config) {
      return { error: "no chosen wallet" };
    }
    console.log("logged: ", getAccount(modalStore.config));

    const from = selectedWallet.value.wallet.address;
    const to = receivingWalletAddress.value;
    const token = transferredCoin.address;
    const decimals = selectedWallet.value.tokens.filter(
      (token) => token.symbol === transferredCoin.symbol,
    )[0].decimals;
    const amount = transferredTokenAmount.value;
    const { numerator, denominator } = convertToFraction(amount);
    const calculation =
      BigInt(numerator * BigInt(Math.pow(10, decimals))) / BigInt(denominator);
    console.log("calculation: ", calculation);
    if (
      from === "" ||
      to === "" ||
      token === "" ||
      amount === "" ||
      !chekckIfProperAmount(transferredTokenAmount.value, /^\d*\.?\d*$/)
    ) {
      console.log("empty values");
      return {
        error: "Values cant be empty",
      };
    } else {
      console.log("transferring tokens...");
      isTransferModalOpen.value = false;
      const cookie = getCookie("accessToken");
      if (!cookie) throw new Error("No accessToken cookie found");
      const emethContractAddress = import.meta.env
        .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;
      try {
        console.log("--> address: emethContractAddress", emethContractAddress);
        console.log("--> token", token);
        console.log("--> to", to);

        const { request } = await simulateContract(modalStore.config, {
          abi: emethContractAbi,
          address: emethContractAddress,
          functionName: "transferToken",
          args: [
            token as `0x${string}`,
            from as `0x${string}`,
            to as `0x${string}`,
            BigInt(calculation),
          ],
        });
        console.log("--> TRANSFER REQUEST", request);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "info",
          message: "Transferring tokens...",
          isVisible: true,
        });

        const transactionHash = await writeContract(modalStore.config, request);

        const receipt = await waitForTransactionReceipt(modalStore.config, {
          hash: transactionHash,
        });

        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "success",
          message: "Success!",
          isVisible: true,
        });

        console.log("[receipt]: ", receipt);
      } catch (err) {
        console.log(err);
        formMessageProvider.messages.push({
          id: formMessageProvider.messages.length,
          variant: "error",
          message: "Something went wrong.",
          isVisible: true,
        });
      }
    }
  });

  const connectWallet = $(() => {
    console.log("clicked connect wallet");
    openWeb3Modal();
  });

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
        </div>

        <button class="custom-border-1 custom-bg-white custom-text-50 row-span-1 row-start-2 mb-[8px] flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs">
          <IconSearch />
          Search for wallet
        </button>

        <button class="custom-border-1 custom-bg-white row-span-1 row-start-3 mb-[24px] flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs text-white">
          Choose Network
          <IconArrowDown />
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
            <IconInfo /> Pending authorization
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
            isTransferModalOpen={isTransferModalOpen}
            transferredCoin={transferredCoin}
          />
        )}
      </div>

      {isAddWalletModalOpen.value && (
        <Modal isOpen={isAddWalletModalOpen} title="Add Wallet">
          <Form class="p-[24px]">
            <IsExecutableSwitch addWalletFormStore={addWalletFormStore} />
            <AddWalletFormFields
              addWalletFormStore={addWalletFormStore}
              onConnectWalletClick={connectWallet}
              isWalletConnected={temporaryModalStore.isConnected}
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
              onClick$={handleAddWallet}
              type="button"
              class="custom-bg-button absolute bottom-[20px] right-[24px] h-[32px] rounded-3xl p-[1px] font-normal text-white duration-300 ease-in-out hover:scale-110 disabled:scale-100"
              disabled={
                addWalletFormStore.isExecutable
                  ? isExecutableDisabled(addWalletFormStore)
                  : isNotExecutableDisabled(addWalletFormStore)
              }
            >
              <p
                class={`rounded-3xl px-[8px] py-[7px] text-xs ${
                  addWalletFormStore.isExecutable
                    ? isExecutableClass(addWalletFormStore)
                    : isNotExecutableClass(addWalletFormStore)
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

      {isTransferModalOpen.value ? (
        <Modal isOpen={isTransferModalOpen} title="Transfer">
          <Form>
            <div class="p-4">
              <p class="mb-[16px] mt-4 flex items-center gap-2 text-sm">
                {transferredCoin.symbol ? transferredCoin.symbol : null}
              </p>

              <label
                for="receivingWallet"
                class="block pb-1 text-xs text-white"
              >
                Receiving Wallet Address
              </label>
              <input
                type="text"
                name="receivingWallet"
                class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
                placeholder="Place wallet address"
                value={receivingWalletAddress.value}
                onInput$={(e) => {
                  const target = e.target as HTMLInputElement;
                  receivingWalletAddress.value = target.value;
                }}
              />
              <label
                for="receivingWallet"
                class="block pb-1 text-xs text-white"
              >
                Amount
              </label>
              <input
                type="text"
                name="transferredTokenAmount"
                class={`border-white-opacity-20 mb-5 block w-full rounded bg-transparent p-3 text-sm placeholder-white placeholder-opacity-50`}
                placeholder="Please enter digits and at most one dot"
                value={transferredTokenAmount.value}
                onInput$={(e) => {
                  const target = e.target as HTMLInputElement;
                  const regex = /^\d*\.?\d*$/;
                  target.value = replaceNonMatching(target.value, regex, "");
                  transferredTokenAmount.value = target.value;
                }}
              />
              <span class="block pb-1 text-xs text-white">
                {!chekckIfProperAmount(
                  transferredTokenAmount.value,
                  /^\d*\.?\d*$/,
                ) ? (
                  <span class="text-xs text-red-500">
                    Invalid amount. There should be only one dot.
                  </span>
                ) : null}
              </span>
              <button
                class="custom-border-1 custom-bg-white row-span-1 row-start-3 mb-[24px] flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs text-white"
                onClick$={() => handleTransfer()}
              >
                transfer
              </button>
            </div>
          </Form>
        </Modal>
      ) : null}
    </div>
  );
});

const isExecutableDisabled = (addWalletFormStore: addWalletFormStore) =>
  addWalletFormStore.name === "" ||
  !isValidName(addWalletFormStore.name);
  // !isPrivateKey32Bytes(addWalletFormStore.privateKey) ||
  // !isPrivateKeyHex(addWalletFormStore.privateKey);

const isNotExecutableDisabled = (addWalletFormStore: addWalletFormStore) =>
  addWalletFormStore.name === "" ||
  addWalletFormStore.address === "" ||
  !isValidName(addWalletFormStore.name) ||
  !isValidAddress(addWalletFormStore.address);

const isExecutableClass = (addWalletFormStore: addWalletFormStore) =>
  isExecutableDisabled(addWalletFormStore)
    ? "bg-modal-button text-gray-400"
    : "bg-black";

const isNotExecutableClass = (addWalletFormStore: addWalletFormStore) =>
  isNotExecutableDisabled(addWalletFormStore)
    ? "bg-modal-button text-gray-400"
    : "bg-black";
