import { type Surreal } from "surrealdb.js";
import { z } from "@builder.io/qwik-city";
import { checksumAddress, getAddress } from "viem";

export const GetResultAddresses = z.object({
  "->observes_wallet": z.object({
    out: z.object({
      address: z.array(z.string()),
    }),
  }),
});

export type GetResultAddresses = z.infer<typeof GetResultAddresses>;

export const getResultAddresses = async (db: Surreal, userId: string) => {
  const resultAddresses = (
    await db.query(`SELECT ->observes_wallet.out.address FROM ${userId};`)
  ).at(0);
  console.log("resultAddresses", resultAddresses);
  return GetResultAddresses.array().parse(resultAddresses);
};

export const GetWalletDetails = z.object({
  chainId: z.number(),
  id: z.string(),
  name: z.string(),
});

export type GetWalletDetails = z.infer<typeof GetWalletDetails>;

export const getWalletDetails = async (db: Surreal, address: string) => {
  const walletDetails = (
    await db.query(
      `SELECT id, name, chainId FROM wallet WHERE address = '${getAddress(address)}';`,
    )
  ).at(0);
  console.log("walletDetails", walletDetails);
  return GetWalletDetails.array().parse(walletDetails);
};

export const GetBalanceToUpdate = z.object({
  id: z.string(),
  value: z.string(),
});

export type GetBalanceToUpdate = z.infer<typeof GetBalanceToUpdate>;

export const getBalanceToUpdate = async (
  db: Surreal,
  accountAddress: string,
  tokenAddress: string,
) => {
  const balanceToUpdate = (
    await db.query(
      `SELECT * FROM balance WHERE ->(for_wallet WHERE out.address = '${getAddress(accountAddress)}') AND ->(for_token WHERE out.address = '${getAddress(tokenAddress)}');`,
    )
  ).at(0);
  console.log("balanceToUpdate", balanceToUpdate);
  return GetBalanceToUpdate.array().parse(balanceToUpdate);
};

export const GetDBTokensAddresses = z.array(
  z.object({
    address: z.string(),
  }),
);

export type GetDBTokensAddresses = z.infer<typeof GetDBTokensAddresses>;

export const getDBTokensAddresses = async (db: Surreal) => {
  const tokensAddresses = (await db.query(`SELECT address FROM token;`)).at(0);
  console.log("tokensAddresses", tokensAddresses);
  return GetDBTokensAddresses.parse(tokensAddresses);
};

export const GetDBTokenPriceUSD = z.object({
  priceUSD: z.string(),
});

export type GetDBTokenPriceUSD = z.infer<typeof GetDBTokenPriceUSD>;

export const getDBTokenPriceUSD = async (db: Surreal, tokenAddress: string) => {
  const tokenPriceUSD = (
    await db.query(
      `SELECT priceUSD FROM token WHERE address = '${checksumAddress(tokenAddress as `0x${string}`)}';`,
    )
  ).at(0);
  console.log("tokenPriceUSD", tokenPriceUSD);
  return GetDBTokenPriceUSD.array().parse(tokenPriceUSD);
};

const TokenDayDataSchema = z.object({
  token: z.object({
    id: z.string(),
  }),
  priceUSD: z.string(),
});

const TokenDayDataResponseSchema = z.object({
  data: z.object({
    tokenDayData: z.array(TokenDayDataSchema),
  }),
});

export async function fetchTokenDayData(
  uniswapSubgraphURL: string,
  tokenAddresses: string[],
) {
  const query = `
  {
    tokenDayDatas(
      first: ${tokenAddresses.length}
      where: {
        token_in: ${JSON.stringify(tokenAddresses)}
      }
      orderBy: date
      orderDirection: desc
    ) {
      token {
        id
      }
      priceUSD
    }
  }`;

  const response = await fetch(uniswapSubgraphURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });

  const jsonResponse = await response.json();
  jsonResponse.data.tokenDayData = jsonResponse.data.tokenDayDatas;
  delete jsonResponse.data.tokenDayDatas;
  const {
    data: { tokenDayData },
  } = TokenDayDataResponseSchema.parse(jsonResponse);

  return tokenDayData;
}
