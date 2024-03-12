import { type Wallet } from "../auth/Wallet";
import { type Token } from "../token/Token";

type WalletWithNativeBalance = Wallet & { nativeBalance: bigint };
type TokenWithBalance = Omit<Token, "address"> & {
  balance: string;
  balanceValueUSD: string;
};

export type WalletTokensBalances = {
  wallet: WalletWithNativeBalance;
  tokens: TokenWithBalance[];
};
