import { z } from "zod";

const TokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.string(),
});

const BalanceSchema = z.object({
  id: z.string(),
  token: TokenSchema,
  amount: z.string(),
});

const AccountSchemaWithID = z.object({
  id: z.string(),
  balances: z.array(BalanceSchema),
});

const AccountSchemaWithoutID = z.object({
  balances: z.array(BalanceSchema),
});

export type Token = z.infer<typeof TokenSchema>;
export type Balance = z.infer<typeof BalanceSchema>;
export type AccountWithID = z.infer<typeof AccountSchemaWithID>;
export type AccountWithoutID = z.infer<typeof AccountSchemaWithoutID>;

export async function fetchSubgraphOneAccount(
  address: string,
  subgraphURL: string,
): Promise<AccountWithoutID> {
  const response = await fetch(subgraphURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
          {
            account(id: "${address.toLowerCase()}") {
              balances {
                id
                token {
                  id
                  name
                  symbol
                  decimals
                }
                amount
              }
            }
          }
        `,
    }),
  });

  const jsonResponse = await response.json();
  if (!jsonResponse.data.account) {
    throw new Error("No account in response");
  }

  const { account } = jsonResponse.data;

  return AccountSchemaWithoutID.parse(account);
}

export async function fetchSubgraphAccountsData(
  addresses: string[],
  subgraphURL: string,
): Promise<AccountWithID[]> {
  const response = await fetch(subgraphURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
          {
            accounts(where: { id_in: ${JSON.stringify(addresses).toLowerCase()} }) {
              id
              balances {
                id
                token {
                  id
                  name
                  symbol
                  decimals
                }
                amount
              }
            }
          }
        `,
    }),
  });

  const {
    data: { accounts },
  } = await response.json();

  return accounts.map((account: any) => AccountSchemaWithID.parse(account));
}
