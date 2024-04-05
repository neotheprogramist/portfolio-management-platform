import { type Wallet } from "../auth/Wallet";
import { type Token } from "../token/Token";

type WalletWithNativeBalance = Wallet & { nativeBalance: bigint };
export type TokenWithBalance = Token & {
  balance: string;
  balanceValueUSD: string;
  imagePath: string;
  balanceId?: string;
  decimals: number;
  allowance: string;
};

export type WalletTokensBalances = {
  wallet: WalletWithNativeBalance;
  tokens: TokenWithBalance[];
};
