import { type Token } from "~/interface/token/Token";
import { connectToDB } from "./db";
import { contractABI, publicClient } from "~/abi/abi";

export const setupTokensData = async () => {
  const db = await connectToDB(
    process.env.SURREALDB_URL || "http://localhost:8000",
    process.env.SURREALDB_USER || "root",
    process.env.SURREALDB_PASS || "root",
    process.env.SURREALDB_NS || "test",
    process.env.SURREALDB_DB || "test",
  );
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
