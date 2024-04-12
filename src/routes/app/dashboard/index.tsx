import { $, component$, useSignal, useStore, useTask$ } from "@builder.io/qwik";
import { PortfolioValue } from "~/components/portfolioValue/portfolioValue";
import { ActionAlertMessage } from "~/components/ActionAlertsMessage/ActionAlertsMessage";
import {
  SuccessStatus,
  WarningStatus,
} from "~/components/ActionAlertsMessage/ActionStatus";
import { TokenRow } from "~/components/tokens/tokenRow";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectToDB } from "~/utils/db";
import { routeAction$, routeLoader$, useNavigate } from "@builder.io/qwik-city";
import {
  fetchTokenDayData,
  getDBTokenPriceUSD,
  getDBTokensAddresses,
  getTokenImagePath,
} from "~/interface/wallets/observedWallets";
import { checksumAddress } from "viem";
import { type Wallet } from "~/interface/auth/Wallet";
import {
  convertWeiToQuantity,
  getTotalValueChange,
} from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";
import { type Balance, type PeriodState } from "~/interface/balance/Balance";
import { type Token } from "~/interface/token/Token";
import { testPublicClient } from "../wallets/testconfig";
import { contractABI } from "~/abi/abi";
import Moralis from "moralis";
import {
  generateTimestamps,
  getSelectedPeriodInHours,
} from "~/utils/timestamps/timestamp";
import { EvmChain } from "@moralisweb3/common-evm-utils";

function mapTokenAddress(sepoliaAddress: string): any {
  const tokenMap: any = {
    "0x054E1324CF61fe915cca47C48625C07400F1B587":
      "0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429",
    "0xD418937d10c9CeC9d20736b2701E506867fFD85f":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709":
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
  };
  if (sepoliaAddress in tokenMap) {
    return tokenMap[sepoliaAddress];
  } else {
    return null;
  }
}
export const useToggleChart = routeAction$(async (data, requestEvent) => {
  const selectedPeriod: { period: number; interval: number } =
    getSelectedPeriodInHours(data as PeriodState);
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(
    `SELECT VALUE ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");
  const observedWalletsQueryResult = result[0];

  const dashboardBalance: { tokenAddress: string; balance: string }[] = [];
  const ethBlocks = [];
  const sepBlocks = [];
  const chartData = [];
  const chartTimestamps = generateTimestamps(
    selectedPeriod.period,
    selectedPeriod.interval,
  );
  for (const item of chartTimestamps) {
    try {
      const blockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.ETHEREUM,
        date: item,
      });
      ethBlocks.push(blockDetails.raw.block);

      const sepoliaBlockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.SEPOLIA,
        date: item,
      });
      sepBlocks.push(sepoliaBlockDetails.raw.block);
    } catch (error) {
      console.error(error);
    }
  }

  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      const formattedBalance = convertWeiToQuantity(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        dashboardBalance.push({
          tokenAddress: token.address,
          balance: formattedBalance,
        });
      }
    }

    try {
      for (let i = 0; i < chartTimestamps.length; i++) {
        try {
          const tokenBalance =
            await Moralis.EvmApi.token.getWalletTokenBalances({
              chain: EvmChain.SEPOLIA,
              toBlock: sepBlocks[i],
              tokenAddresses: [
                "0x054E1324CF61fe915cca47C48625C07400F1B587",
                "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
                "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
              ],
              address: wallet.address,
            });
          let partBalance: number = 0;
          for (const balanceEntry of dashboardBalance) {
            const ethTokenAddress = mapTokenAddress(balanceEntry.tokenAddress);
            const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM,
              toBlock: ethBlocks[i],
              address: ethTokenAddress,
            });

            partBalance += tokenBalance.raw
              .filter((item) => item.symbol === tokenPrice.raw.tokenSymbol)
              .reduce((sum, currentItem) => {
                return (
                  sum +
                  parseFloat(currentItem.balance) * tokenPrice.raw.usdPrice
                );
              }, 0);
          }
          chartData.push(partBalance);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    chartData: chartData.map((value, index) => [
      index,
      parseFloat(value.toFixed(2)),
    ]) as [number, number][],
  };
});
export const usePortfolio24hChange = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(
    `SELECT VALUE ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");

  const observedWalletsQueryResult = result[0];

  const dashboardBalance: { tokenAddress: string; balance: string }[] = [];
  const valueChange: { valueChangeUSD: string; percentageChange: string }[] =
    [];
  let totalBalance = 0;

  const ethBlocks = [];
  const sepBlocks = [];
  const chartData = [];
  const chartTimestamps = generateTimestamps(24, 4);

  for (const item of chartTimestamps) {
    try {
      const blockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.ETHEREUM,
        date: item,
      });
      ethBlocks.push(blockDetails.raw.block);

      const sepoliaBlockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: EvmChain.SEPOLIA,
        date: item,
      });
      sepBlocks.push(sepoliaBlockDetails.raw.block);
    } catch (error) {
      console.error(error);
    }
  }

  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      const formattedBalance = convertWeiToQuantity(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        dashboardBalance.push({
          tokenAddress: token.address,
          balance: formattedBalance,
        });
      }
    }

    try {
      for (let i = 0; i < chartTimestamps.length; i++) {
        try {
          const tokenBalance =
            await Moralis.EvmApi.token.getWalletTokenBalances({
              chain: EvmChain.SEPOLIA,
              toBlock: sepBlocks[i],
              tokenAddresses: [
                "0x054E1324CF61fe915cca47C48625C07400F1B587",
                "0xD418937d10c9CeC9d20736b2701E506867fFD85f",
                "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709",
              ],
              address: wallet.address,
            });
          let partBalance: number = 0;
          for (const balanceEntry of dashboardBalance) {
            const ethTokenAddress = mapTokenAddress(balanceEntry.tokenAddress);
            const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
              chain: EvmChain.ETHEREUM,
              toBlock: ethBlocks[i],
              include: "percent_change",
              address: ethTokenAddress,
            });
            console.log("Token Price", tokenPrice);

            partBalance += tokenBalance.raw
              .filter((item) => item.symbol === tokenPrice.raw.tokenSymbol)
              .reduce((sum, currentItem) => {
                return (
                  sum +
                  parseFloat(currentItem.balance) * tokenPrice.raw.usdPrice
                );
              }, 0);

            if (
              tokenPrice.raw["24hrPercentChange"] &&
              tokenPrice.raw.usdPrice
            ) {
              valueChange.push({
                valueChangeUSD: (
                  parseFloat(tokenPrice.raw["24hrPercentChange"]) *
                  parseInt(balanceEntry.balance) *
                  0.01
                ).toFixed(2),
                percentageChange:
                  (parseFloat(tokenPrice.raw["24hrPercentChange"]).toFixed(
                    2,
                  ) as string) + "%",
              });
              totalBalance +=
                parseFloat(balanceEntry.balance) * tokenPrice.raw.usdPrice;
            }
          }
          chartData.push(partBalance);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
    const totalValueChange = getTotalValueChange(valueChange);

    return {
      valueChange: totalValueChange.toFixed(2),
      percentageChange:
        ((100 * totalValueChange) / totalBalance).toFixed(2) + "%",
      chartData: chartData.map((value, index) => [
        index,
        parseFloat(value.toFixed(2)),
      ]) as [number, number][],
    };
  }
});

export const useTotalPortfolioValue = routeLoader$(async (requestEvent) => {
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

  let totalValue = 0;

  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);
    const nativeBalance = await testPublicClient.getBalance({
      address: wallet.address as `0x${string}`,
      blockTag: "safe",
    });
    await db.query(
      `UPDATE ${observedWallet} SET nativeBalance = '${nativeBalance}';`,
    );

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await testPublicClient.readContract({
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

      const formattedBalance = convertWeiToQuantity(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        // Add the token to the wallet object
        const [{ priceUSD }] = await getDBTokenPriceUSD(db, token.address);
        const balanceValueUSD = (
          Number(formattedBalance) * Number(priceUSD)
        ).toFixed(2);
        totalValue += Number(balanceValueUSD);
      }
    }
  }
  return totalValue.toFixed(2);
});

export const useGetFavoriteTokens = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;
  const [result]: any = await db.query(
    `SELECT * FROM ${userId}->has_structure WHERE out.name = 'Favourite Tokens';`,
  );
  if (!result.length) return [];
  // console.log("result", result);
  const createdStructure = result[0].out;

  // console.log("createdStructure", createdStructure);
  const availableStructures: any[] = [];

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
    const [imagePath] = await getTokenImagePath(db, token[0].symbol);
    // console.log("---------IMAGE PATH---------", imagePath.imagePath);
    const tokenWithBalance = {
      id: token[0].id,
      name: token[0].name,
      symbol: token[0].symbol,
      decimals: token[0].decimals,
      balance: tokenBalance[0].value,
      balanceValueUSD: tokenValue.priceUSD,
      imagePath: imagePath.imagePath,
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

  // console.log("Available Structures from routeloader: ", availableStructures);
  return availableStructures;
});

export default component$(() => {
  const nav = useNavigate();
  const isPortfolioFullScreen = useSignal(false);
  const totalPortfolioValue = useTotalPortfolioValue();
  const favoriteTokens = useGetFavoriteTokens();
  const toggleChart = useToggleChart();
  const portfolioValueChange = usePortfolio24hChange();
  const chartDataStore = useStore({
    data: portfolioValueChange.value?.chartData ?? [
      [0, 0],
      [0, 0],
    ],
  });
  const changePeriod = useSignal(false);
  const selectedPeriod: PeriodState = useStore({
    "24h": true,
    "1W": false,
    "1M": false,
    "1Y": false,
  });

  const togglePeriod = $(function togglePeriod(button: string) {
    for (const key in selectedPeriod) {
      selectedPeriod[key] = false;
    }
    selectedPeriod[button] = true;
  });

  useTask$(async ({ track }) => {
    track(async () => {
      selectedPeriod["24h"];
      selectedPeriod["1W"];
      selectedPeriod["1M"];
      selectedPeriod["1Y"];

      if (changePeriod.value !== false) {
        const newChartData = await toggleChart.submit(selectedPeriod);
        console.log("=========================");
        console.log(newChartData);
        console.log("=========================");
        chartDataStore.data = newChartData.value.chartData;
      }
    });
  });

  return isPortfolioFullScreen.value ? (
    <PortfolioValue
      totalPortfolioValue={totalPortfolioValue.value}
      isPortfolioFullScreen={isPortfolioFullScreen}
      portfolioValueChange={portfolioValueChange.value}
      chartData={chartDataStore.data}
      selectedPeriod={selectedPeriod}
      onClick$={(e: any) => {
        togglePeriod(e.target.name);
        changePeriod.value = true;
      }}
    />
  ) : (
    <div class="grid grid-cols-4 grid-rows-[48%_48%] gap-6 overflow-auto p-10">
      <PortfolioValue
        totalPortfolioValue={totalPortfolioValue.value}
        isPortfolioFullScreen={isPortfolioFullScreen}
        portfolioValueChange={portfolioValueChange.value}
        chartData={chartDataStore.data}
        selectedPeriod={selectedPeriod}
        onClick$={(e: any) => {
          togglePeriod(e.target.name);
          changePeriod.value = true;
        }}
      />

      <div class="custom-border-1 custom-shadow col-start-3 row-span-1 row-start-1 grid grid-rows-[32px_1fr] gap-4 overflow-auto rounded-[16px] p-6">
        <div class="flex items-center justify-between">
          <h1 class="text-[20px] font-semibold">Alerts</h1>
          <button class="custom-border-2 rounded-[40px] px-4 py-[11px] text-[12px] font-medium duration-300 ease-in-out hover:scale-110">
            See All
          </button>
        </div>
        <div class="overflow-auto">
          <ActionAlertMessage
            title="Bitcoin share exceeded 20%"
            description="6 hours ago"
          />
          <ActionAlertMessage
            title="Bitcoin share exceeded 20%"
            description="6 hours ago"
          />
          <ActionAlertMessage
            title="Bitcoin share exceeded 20%"
            description="6 hours ago"
          />
          <ActionAlertMessage
            title="Bitcoin share exceeded 20%"
            description="6 hours ago"
          />
          <ActionAlertMessage
            title="Bitcoin share exceeded 20%"
            description="6 hours ago"
          />
        </div>
      </div>

      <div class="custom-border-1 custom-shadow col-start-4 row-span-1 row-start-1 grid grid-rows-[32px_1fr] gap-4 overflow-auto rounded-[16px] p-6">
        <div class="flex items-center justify-between">
          <h1 class="text-[20px] font-semibold">Actions</h1>
          <button class="custom-border-2 rounded-[40px] px-4 py-[11px] text-[12px] font-medium duration-300 ease-in-out hover:scale-110">
            See All
          </button>
        </div>
        <div class="overflow-auto">
          <ActionAlertMessage
            title="Automation name #1"
            description="6 hours ago"
          >
            <SuccessStatus />
          </ActionAlertMessage>
          <ActionAlertMessage
            title="Automation name #2"
            description="6 hours ago"
          >
            <SuccessStatus />
          </ActionAlertMessage>
          <ActionAlertMessage title="DCA" description="1 day ago">
            <WarningStatus />
          </ActionAlertMessage>
          <ActionAlertMessage
            title="Automation name #3"
            description="6 hours ago"
          >
            <SuccessStatus />
          </ActionAlertMessage>
          <ActionAlertMessage
            title="Automation name #4"
            description="6 hours ago"
          >
            <SuccessStatus />
          </ActionAlertMessage>
          <ActionAlertMessage
            title="Automation name #5"
            description="6 hours ago"
          >
            <WarningStatus />
          </ActionAlertMessage>
        </div>
      </div>

      <div class="custom-border-1 col-start-1 col-end-5 row-span-1 row-start-2 grid grid-rows-[32px_32px_1fr] gap-6 overflow-auto rounded-[16px] p-6">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">Favourite Tokens</h1>
          <button
            class="custom-border-2 rounded-[40px] px-4 py-[11px] text-xs font-medium duration-300 ease-in-out hover:scale-110"
            onClick$={() => {
              nav("/app/portfolio");
            }}
          >
            Go To Portfolio
          </button>
        </div>

        <div
          style="grid-template-columns: minmax(200px, 500px) minmax(100px, 300px) minmax(150px, 300px) minmax(250px, 400px) repeat(2, minmax(120px, 400px)) minmax(100px, 400px) 40px;"
          class="custom-text-50 grid items-center gap-2 text-xs font-normal uppercase"
        >
          <div class="">Token name</div>
          <div class="">Quantity</div>
          <div class="">Value</div>
          <div class="custom-border-1 flex h-8 w-fit gap-2 rounded-[8px] bg-white bg-opacity-5 p-[3.5px] text-white">
            <button class="custom-bg-button rounded-[8px] px-2">24h</button>
            <button class="rounded-[8px] px-2">3d</button>
            <button class="rounded-[8px] px-2">30d</button>
          </div>
          <div class="">Wallet</div>
          <div class="">Network</div>
          <div class="">Subportfolio</div>
          <div class=""></div>
        </div>

        <div class="row-span-1 row-start-3 inline-block h-full min-w-full overflow-auto">
          <div class="overflow-auto">
            {favoriteTokens.value[0] &&
              favoriteTokens.value[0].structureBalance.map(
                async (token: any, index: number) => {
                  const formattedBalance = convertWeiToQuantity(
                    token.balance.balance.toString(),
                    parseInt(token.balance.decimals),
                  );
                  return (
                    <TokenRow
                      key={`id_${index}_${token.balance.name}`}
                      subportfolio={favoriteTokens.value[0].structure.name}
                      tokenName={token.balance.name}
                      tokenSymbol={token.balance.symbol}
                      quantity={formattedBalance}
                      value={(
                        Number(formattedBalance) *
                        Number(token.balance.balanceValueUSD)
                      ).toFixed(2)}
                      wallet={token.wallet.name}
                      networkName={chainIdToNetworkName[token.wallet.chainId]}
                      imagePath={token.balance.imagePath}
                    />
                  );
                },
              )}
          </div>
        </div>
      </div>
    </div>
  );
});
