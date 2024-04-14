import { server$, type RequestHandler } from "@builder.io/qwik-city";
import type WebSocketStrategy from "surrealdb.js";
import { checksumAddress } from "viem";
import { connectToDB } from "~/utils/db";

export const onPost: RequestHandler = async ({ request, env, json, status }) => {
  // json(200, { message: "Hello from webhook!" });
  const db = await connectToDB(env);
  const webhook = await request.json();
  console.log("WHOLE WEBHOOK:", webhook);
  const transfers = webhook["erc20Transfers"];
  if (transfers) {
    for (const transfer of transfers) {
      const { from, to, tokenSymbol, triggers } = transfer;
      for (const trigger of triggers) {
        if (trigger.name === "fromBalance") {
          await updateBalanceIfExists(db, from, tokenSymbol, trigger.value);
        } else {
          await updateBalanceIfExists(db, to, tokenSymbol, trigger.value);
        }
      }
    }
  }
  json(200, {});
};

const updateBalanceIfExists = server$(async function (
  db: WebSocketStrategy,
  address: string,
  tokenSymbol: string,
  value: string,
) {
  console.log("====================================");
  const [[updatedBalance]]: any = await db.query(
    `UPDATE balance SET value = '${value}' WHERE ->(for_wallet WHERE out.address = '${checksumAddress(address as `0x${string}`)}') AND ->(for_token WHERE out.symbol = '${tokenSymbol}');`,
  );
  console.log("updatedBalance", updatedBalance);
  console.log("====================================");
});
