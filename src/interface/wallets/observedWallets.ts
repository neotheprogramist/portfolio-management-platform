import { type Surreal } from "surrealdb.js";
import { z } from "@builder.io/qwik-city";
import { getAddress } from "viem";
import { AccountWithID } from "~/utils/subgraph/fetch";

export const GetResultAddresses = z.object({
  '->observes_wallet': z.object({
    out: z.object({
      address: z.array(z.string()),
    }),
  }),
});

export type GetResultAddresses = z.infer<typeof GetResultAddresses>;

export const getResultAddresses = async (db: Surreal, userId: string) => {
  const resultAddresses = (await db.query(
    `SELECT ->observes_wallet.out.address FROM ${userId};`,
  )).at(0);
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
  const walletDetails = (await db.query(
    `SELECT id, name, chainId FROM wallet WHERE address = '${getAddress(address)}';`,
  )).at(0);
  console.log("walletDetails", walletDetails);
  return GetWalletDetails.array().parse(walletDetails);
}

export const GetBalanceToUpdate = z.object({
  id: z.string(),
  value: z.string(),
});

export type GetBalanceToUpdate = z.infer<typeof GetBalanceToUpdate>;

export const getBalanceToUpdate = async (db: Surreal, accountAddress: string, tokenAddress: string) => {
  const balanceToUpdate = (await db.query(
    `SELECT * FROM balance WHERE ->(for_wallet WHERE out.address = '${getAddress(accountAddress)}') AND ->(for_token WHERE out.address = '${getAddress(tokenAddress)}');`,
  )).at(0);
  console.log("balanceToUpdate", balanceToUpdate);
  return GetBalanceToUpdate.array().parse(balanceToUpdate);
}