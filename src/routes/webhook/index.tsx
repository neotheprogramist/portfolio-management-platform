import { type RequestHandler } from "@builder.io/qwik-city";

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
      }
    }

    json(200, { message: "Success" });
  } catch (error) {
    console.error(error);
    json(500, { message: "Internal Server Error - erc20 transfers failed" });
  }
};
