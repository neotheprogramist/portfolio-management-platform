import { type Token } from "~/interface/token/Token";
import { connectToDB } from "./db";
import { contractABI, publicClient } from "~/abi/abi";

export const setupTokensData = async () => {
  const db = await connectToDB();
  const tokens = await db.select<Token>("token");
  for (const token of tokens) {
    const symbol = await publicClient.readContract({
      address: token.address as `0x${string}`,
      abi: contractABI,
      functionName: "symbol",
    });
    const name = await publicClient.readContract({
      address: token.address as `0x${string}`,
      abi: contractABI,
      functionName: "name",
    });
    const decimals = await publicClient.readContract({
      address: token.address as `0x${string}`,
      abi: contractABI,
      functionName: "decimals",
    });

    await db.query(`UPDATE ${token.id} SET symbol = '${symbol}';`);
    await db.query(`UPDATE ${token.id} SET name = '${name}';`);
    await db.query(`UPDATE ${token.id} SET decimals = '${decimals}';`);
  }
};
