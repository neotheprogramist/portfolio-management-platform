import { type Surreal } from "surrealdb.js";
import { type Wallet } from "../auth/Wallet";
import { z } from "@builder.io/qwik-city";

export const walletExists = async (db: Surreal, walletId: string): Promise<boolean> => {
  const queryResult = (await db.select<Wallet>(`${walletId}`)).at(0);
  console.log("walletToRemove", queryResult);
  return !!queryResult;
};

export const GetUsersObservingWalletResult = z.object({
    '<-observes_wallet': z.object({
      in: z.array(z.any()),
    }),
  });
  export type GetUsersObservingWalletResult = z.infer<typeof GetUsersObservingWalletResult>;
  
  export const getUsersObservingWallet = async (db: Surreal, walletId: string) => {
    const usersObservingWallet = (
        await db.query(`SELECT <-observes_wallet.in FROM ${walletId};`)
      ).at(0);
    console.log("usersObservingWallet", usersObservingWallet);
    return GetUsersObservingWalletResult.array().parse(usersObservingWallet);
  };