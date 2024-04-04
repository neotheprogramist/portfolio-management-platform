import { $, component$, useSignal, useStore, useTask$ } from "@builder.io/qwik";
import { PortfolioValue } from "~/components/portfolioValue/portfolioValue";
import { Alert } from "~/components/alerts/alert";
import { Action } from "~/components/actions/action";
import { TokenRow } from "~/components/tokens/tokenRow";
import IconWarning from "/public/assets/icons/dashboard/warning.svg?jsx";
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
import { type Balance, PeriodState } from "~/interface/balance/Balance";
import { type Token } from "~/interface/token/Token";
import { testPublicClient } from "../wallets/testconfig";
import { contractABI } from "~/abi/abi";
import Moralis from "moralis";
import {
  generateTimestamps,
  getSelectedPeriodInHours,
} from "~/utils/timestamps/timestamp";

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
  const blocks = [];
  const chartData = [];
  const chartTimestamps = generateTimestamps(
    selectedPeriod.period,
    selectedPeriod.interval,
  );
  for (const item of chartTimestamps) {
    try {
      const blockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: "0x1",
        date: item,
      });
      blocks.push(blockDetails.raw.block);
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
      // await Moralis.start({
      //   apiKey: requestEvent.env.get("MORALIS_API_KEY")
      // })

      for (const balanceEntry of dashboardBalance) {
        for (const block of blocks) {
          try {
            const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
              chain: "0x1",
              toBlock: block,
              address: balanceEntry.tokenAddress,
            });

            chartData.push(
              tokenPrice.raw.usdPrice * parseFloat(balanceEntry.balance),
            );
          } catch (error) {
            console.error(error);
          }
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
  const currentUnixDate = new Date(Date.now())
    .toISOString()
    .replace(/\.(\d+)Z$/, "+00:00");

  const valueChange: { valueChangeUSD: string; percentageChange: string }[] =
    [];
  let totalBalance = 0;

  const blocks = [];
  const chartData = [];
  const chartTimestamps = generateTimestamps(24, 6);
  for (const item of chartTimestamps) {
    try {
      await Moralis.start({
        apiKey: requestEvent.env.get("MORALIS_API_KEY"),
      });

      const blockDetails = await Moralis.EvmApi.block.getDateToBlock({
        chain: "0x1",
        date: item,
      });
      blocks.push(blockDetails.raw.block);
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
      for (const balanceEntry of dashboardBalance) {
        const blockDetails = await Moralis.EvmApi.block.getDateToBlock({
          chain: "0x1",
          date: currentUnixDate,
        });

        const tokenPriceChange = await Moralis.EvmApi.token.getTokenPrice({
          chain: "0x1",
          include: "percent_change",
          toBlock: blockDetails.raw.block,
          address: balanceEntry.tokenAddress,
        });
        if (
          tokenPriceChange.raw["24hrPercentChange"] &&
          tokenPriceChange.raw.usdPrice
        ) {
          valueChange.push({
            valueChangeUSD: (
              parseFloat(tokenPriceChange.raw["24hrPercentChange"]) *
              parseInt(balanceEntry.balance) *
              0.01
            ).toFixed(2),
            percentageChange:
              (parseFloat(tokenPriceChange.raw["24hrPercentChange"]).toFixed(
                2,
              ) as string) + "%",
          });
          totalBalance +=
            parseFloat(balanceEntry.balance) * tokenPriceChange.raw.usdPrice;
        }

        //===========================================================================================
        for (const block of blocks) {
          try {
            const tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
              chain: "0x1",
              toBlock: block,
              address: balanceEntry.tokenAddress,
            });

            chartData.push(
              tokenPrice.raw.usdPrice * parseFloat(balanceEntry.balance),
            );
          } catch (error) {
            console.error(error);
          }
        }
        //===========================================================================================
      }
    } catch (error) {
      console.error(error);
    }
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
  console.log("result", result);
  const createdStructure = result[0].out;

  console.log("createdStructure", createdStructure);
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
    console.log("---------IMAGE PATH---------", imagePath.imagePath);
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

  console.log("Available Structures from routeloader: ", availableStructures);
  return availableStructures;
});

export default component$(() => {
  const nav = useNavigate();
  const isPortfolioFullScreen = useSignal(false);
  const totalPortfolioValue = useTotalPortfolioValue();
  const favoriteTokens = useGetFavoriteTokens();
  const toggleChart = useToggleChart();
  const portfolioValueChange = usePortfolio24hChange();
  const chartDataStore = useStore({ portfolioValueChange });
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
    track(() => {
      selectedPeriod["24h"];
      selectedPeriod["1W"];
      selectedPeriod["1M"];
      selectedPeriod["1Y"];
      if (changePeriod.value !== false) {
        toggleChart.submit(selectedPeriod);
      }
    });
  });

  return isPortfolioFullScreen.value ? (
    <PortfolioValue
      totalPortfolioValue={totalPortfolioValue.value}
      isPortfolioFullScreen={isPortfolioFullScreen}
      portfolioValueChange={portfolioValueChange.value}
      chartData={chartDataStore.portfolioValueChange.value.chartData}
      selectedPeriod={selectedPeriod}
      onClick$={(e: any) => {
        togglePeriod(e.target.name);
        changePeriod.value = true;
      }}
    />
  ) : (
    <div class="grid grid-cols-4 grid-rows-[48%_48%] gap-[24px] overflow-auto p-[40px]">
      <PortfolioValue
        totalPortfolioValue={totalPortfolioValue.value}
        isPortfolioFullScreen={isPortfolioFullScreen}
        portfolioValueChange={portfolioValueChange.value}
        chartData={chartDataStore.portfolioValueChange.value.chartData}
        selectedPeriod={selectedPeriod}
        onClick$={(e: any) => {
          togglePeriod(e.target.name);
          changePeriod.value = true;
        }}
      />

      <div class="custom-border-1 custom-bg-white custom-shadow col-start-3 row-span-1 row-start-1 grid grid-rows-[32px_1fr] gap-[16px] overflow-auto rounded-[16px] p-[24px]">
        <div class="flex items-center justify-between">
          <h1 class="text-[20px] font-semibold">Alerts</h1>
          <button class="custom-border-2 rounded-[40px] px-[14px] py-[6px] text-[12px] font-semibold duration-300 ease-in-out hover:scale-110">
            See All
          </button>
        </div>
        <div class="h-full overflow-auto">
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
        </div>
      </div>

      <div class="custom-border-1 custom-bg-white custom-shadow col-start-4 row-span-1 row-start-1 grid grid-rows-[32px_1fr] gap-[16px] overflow-auto rounded-[16px] p-[24px]">
        <div class="flex items-center justify-between">
          <h1 class="text-[20px] font-semibold">Actions</h1>
          <button class="custom-border-2 rounded-[40px] px-[14px] py-[6px] text-[12px] font-semibold duration-300 ease-in-out hover:scale-110">
            See All
          </button>
        </div>
        <div class="h-full overflow-auto">
          <Action />
          <Action />
          <div class="flex items-center justify-between border-b border-white border-opacity-20 py-[20px]">
            <div class="">
              <h3 class="text-sm">DCA</h3>
              <p class="custom-text-50 text-xs">1 day ago</p>
            </div>
            <div class="custom-bg-white flex h-[28px] items-center gap-[4px] rounded-[8px] border border-[#ffc107] p-[8px]">
              <IconWarning />
              <p class="text-xs text-[#ffc107] lg:hidden">Warning</p>
            </div>
          </div>
          <Action />
          <Action />
          <Action />
        </div>
      </div>

      <div class="custom-border-1 custom-bg-white col-start-1 col-end-5 row-span-1 row-start-2 grid grid-rows-[32px_32px_1fr] gap-[24px] overflow-auto rounded-[16px] p-[24px]">
        <div class="row-span-1 row-start-1 flex items-center justify-between">
          <h1 class="text-xl font-semibold">Favourite Tokens</h1>
          <button
            class="custom-border-2 rounded-[40px] px-[14px] py-[6px] text-[12px] font-semibold duration-300 ease-in-out hover:scale-110"
            onClick$={() => {
              nav("/app/portfolio");
            }}
          >
            Go To Portfolio
          </button>
        </div>

        <div class="row-span-1 row-start-2">
          <div class="custom-text-50 grid grid-cols-[17%_8%_13%_17%_14%_11%_12%_2%] items-center gap-[8px] text-left text-xs uppercase">
            <div class="">Token name</div>
            <div class="">Quantity</div>
            <div class="">Value</div>
            <div class="custom-bg-white custom-border-1 flex h-[32px] w-fit gap-[8px] rounded-[8px] p-[3.5px] text-white">
              <button class="custom-bg-button rounded-[8px] px-[8px]">
                24h
              </button>
              <button class="rounded-[8px] px-[8px]">3d</button>
              <button class="rounded-[8px] px-[8px]">30d</button>
            </div>
            <div class="">Wallet</div>
            <div class="">Network</div>
            <div class="">Subportfolio</div>
            <div class=""></div>
          </div>
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
