import { z } from "@builder.io/qwik-city";
import { type Surreal } from "surrealdb.js";
import { getAddress } from "viem";

export const ExistingWalletResult = z.object({
  id: z.string(),
  chainId: z.number(),
  address: z.string(),
  name: z.string(),
  nativeBalance: z.string().optional(),
});
export type ExistingWalletResult = z.infer<typeof ExistingWalletResult>;

export const getExistingWallet = async (db: Surreal, address: string) => {
  const existingWallet = (
    await db.query(
      `SELECT * FROM wallet WHERE address = type::string($addr);`,
      { addr: address },
    )
  ).at(0);
  console.log("getExistingWallet", existingWallet);
  return ExistingWalletResult.array().parse(existingWallet);
};

export const TokenResult = z.object({
  id: z.string(),
});
export type TokenResult = z.infer<typeof TokenResult>;

export const getTokenByAddress = async (db: Surreal, address: string) => {
  const tokenQueryResult = (
    await db.query(
      `SELECT id FROM token where address = '${getAddress(address)}'`,
    )
  ).at(0);
  console.log("token", tokenQueryResult);
  return TokenResult.array().parse(tokenQueryResult);
};

export const ExistingRelationResult = z.object({
  id: z.string(),
  in: z.string(),
  out: z.string(),
});
export type ExistingRelationResult = z.infer<typeof ExistingRelationResult>;

export const getExistingRelation = async (
  db: Surreal,
  userId: string,
  walletId: string,
) => {
  const existingRelationQueryResult = (
    await db.query(
      `SELECT * FROM ${userId}->observes_wallet WHERE out = ${walletId};`,
    )
  ).at(0);
  console.log("existingRelation", existingRelationQueryResult);
  return ExistingRelationResult.array().parse(existingRelationQueryResult);
};
