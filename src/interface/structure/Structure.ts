import { TokenWithBalance } from "~/interface/walletsTokensBalances/walletsTokensBalances";

export type Structure = {
  structure: { id?: string; name: string };
  structureBalance: StructureBalance[];
};
export type StructureBalance = {
  wallet: { id: string; name: string; chainId: number };
  balance: TokenWithBalance;
};
