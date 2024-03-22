import { component$ } from "@builder.io/qwik";
import { PortfolioValue } from "~/components/portfolioValue/portfolioValue";
import { Alert } from "~/components/alerts/alert";
import { Action } from "~/components/actions/action";
import { TokenRow } from "~/components/tokens/tokenRow";
import ImgWarning from "/public/images/warning.svg?jsx";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectToDB } from "~/utils/db";
import { routeLoader$ } from "@builder.io/qwik-city";
import {
  fetchTokenDayData,
  getDBTokenPriceUSD,
  getDBTokensAddresses,
  getResultAddresses,
} from "~/interface/wallets/observedWallets";
import { fetchSubgraphAccountsData } from "~/utils/subgraph/fetch";
import { checksumAddress } from "viem";
import { formatTokenBalance } from "~/utils/formatBalances/formatTokenBalance";

export const useTotalPortfolioValue = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const resultAddresses = await getResultAddresses(db, userId);
  if (!resultAddresses[0]["->observes_wallet"].out.address.length) {
    return "0";
  }
  console.log("resultAddresses", resultAddresses);

  const observedWalletsAddressesQueryResult =
    resultAddresses[0]["->observes_wallet"].out.address;
  console.log(
    "observedWalletsAddressesQueryResult",
    observedWalletsAddressesQueryResult,
  );

  const subgraphURL = requestEvent.env.get("SUBGRAPH_URL");
  if (!subgraphURL) {
    throw new Error("Missing SUBGRAPH_URL");
  }

  const subgraphAccountsData = await fetchSubgraphAccountsData(
    observedWalletsAddressesQueryResult,
    subgraphURL,
  );
  console.log("subgraphAccountsData", subgraphAccountsData);

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

  let totalValue = 0;

  for (const account of subgraphAccountsData) {
    console.log("account", account);
    for (const balance of account.balances) {
      const [{ priceUSD }] = await getDBTokenPriceUSD(db, balance.token.id);
      const formattedBalance = formatTokenBalance(
        balance.amount.toString(),
        parseInt(balance.token.decimals),
      );
      const balanceValueUSD = Number(formattedBalance) * Number(priceUSD);
      totalValue += balanceValueUSD;
    }
  }
  console.log("totalvalue", totalValue);
  return totalValue.toFixed(2);
});

export default component$(() => {
  const totalPortfolioValue = useTotalPortfolioValue();
  return (
    <div class="grid grid-cols-4 grid-rows-[48%_48%] gap-[24px] overflow-auto p-[40px]">
      <PortfolioValue totalPortfolioValue={totalPortfolioValue.value} />

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
              <ImgWarning />
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
          <button class="custom-border-2 rounded-[40px] px-[14px] py-[6px] text-[12px] font-semibold duration-300 ease-in-out hover:scale-110">
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
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
            <TokenRow />
          </div>
        </div>
      </div>
    </div>
  );
});
