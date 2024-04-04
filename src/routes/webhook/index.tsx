import { server$, type RequestHandler } from "@builder.io/qwik-city";
import { checksumAddress } from "viem";
import { connectToDB } from "~/utils/db";

export const onPost: RequestHandler = async ({ request, json }) => {
  try {
    const webhook = await request.json();
    console.log("stream body", webhook);

    const transfers = webhook["erc20Transfers"];
    console.log("stream transfers", transfers);
    if (transfers) {
      for (const transfer of transfers) {
        const { from, to, tokenSymbol, valueWithDecimals, triggers } = transfer;
        console.log("========================");
        console.log("from", from),
          console.log("to", to),
          console.log("tokenSymbol", tokenSymbol),
          console.log("value", valueWithDecimals),
          console.log("triggers", triggers);
        console.log("========================");
        await updateBalanceIfExists(from, tokenSymbol, triggers[0]["value"]);
        await updateBalanceIfExists(to, tokenSymbol, triggers[1]["value"]);
      }
    }

    json(200, { message: "Success" });
  } catch (error) {
    console.error(error);
    json(500, { message: "Internal Server Error - erc20 transfers failed" });
  }
};

const updateBalanceIfExists = server$(async function (
  address: string,
  tokenSymbol: string,
  value: string,
) {
  console.log("====================================");
  const db = await connectToDB(this.env);
  const [[wallet]]: any = await db.query(
    `SELECT * FROM wallet WHERE address = '${checksumAddress(address as `0x${string}`)}';`,
  );
  console.log("wallet", wallet);
  const [[token]]: any = await db.query(
    `SELECT * FROM token WHERE symbol = '${tokenSymbol}';`,
  );
  console.log("token", token);

  if (!wallet || !token) {
    return;
  }
  const [[balanceToUpdate]]: any = await db.query(
    `SELECT * FROM balance WHERE ->(for_wallet WHERE out = '${wallet.id}') AND ->(for_token WHERE out = '${token.id}');`,
  );
  console.log("balanceToUpdate", balanceToUpdate);
  if (!balanceToUpdate) {
    return;
  }
  await db.query(`UPDATE ONLY ${balanceToUpdate} SET value = '${value}';`);
  console.log("====================================");
});
