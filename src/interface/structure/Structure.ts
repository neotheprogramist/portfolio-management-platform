import { TokenWithBalance } from "~/interface/walletsTokensBalances/walletsTokensBalances";

export type Structure = {
  id?: string;
  name: string;
};

export type StructureBalance = {
  structure: Structure;
  tokens: TokenWithBalance[];
};
