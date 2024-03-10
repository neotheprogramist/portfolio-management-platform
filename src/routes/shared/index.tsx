import {
  routeLoader$,
} from "@builder.io/qwik-city";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { publicClient } from "~/abi/abi";
import { connectToDB } from "~/utils/db";
import { type Balance } from "~/interface/balance/Balance";
import { type WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import { formatTokenBalance } from "~/utils/formatBalances/formatTokenBalance";
import { getAddress } from "viem";
import {
  fetchSubgraphAccountsData,
} from "~/utils/subgraph/fetch";
import {
  getBalanceToUpdate,
  getResultAddresses,
  getWalletDetails,
} from "~/interface/wallets/observedWallets";

export const useObservedWallets = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const resultAddresses = await getResultAddresses(db, userId);
  if (!resultAddresses[0]["->observes_wallet"].out.address.length) {
    return [];
  }
  const observedWalletsAddressesQueryResult =
    resultAddresses[0]["->observes_wallet"].out.address;

  const subgraphURL = requestEvent.env.get("SUBGRAPH_URL");
  if (!subgraphURL) {
    throw new Error("Missing SUBGRAPH_URL");
  }

  const accounts_ = await fetchSubgraphAccountsData(
    observedWalletsAddressesQueryResult,
    subgraphURL,
  );

  const observedWallets: WalletTokensBalances[] = [];

  for (const acc of accounts_) {
    const nativeBalance = await publicClient.getBalance({
      address: getAddress(acc.id) as `0x${string}`,
      blockTag: "safe",
    });
    await db.query(
      `UPDATE wallet SET nativeBalance = '${nativeBalance}' WHERE address = ${getAddress(acc.id)};`,
    );

    const walletDetails = await getWalletDetails(db, acc.id);
    if (!walletDetails.at(0)) return [];

    const walletTokensBalances: WalletTokensBalances = {
      wallet: {
        id: walletDetails[0].id,
        name: walletDetails[0].name,
        chainId: walletDetails[0].chainId,
        address: getAddress(acc.id),
        nativeBalance: nativeBalance,
      },
      tokens: [],
    };

    for (const balance of acc.balances) {
      const balanceToUpdate = await getBalanceToUpdate(
        db,
        acc.id,
        balance.token.id,
      );
      const [updatedBalance] = await db.update<Balance>(
        `${balanceToUpdate[0].id}`,
        {
          value: balance.amount.toString(),
        },
      );

      const formattedBalance = formatTokenBalance(
        updatedBalance.value.toString(),
        parseInt(balance.token.decimals),
      );

      if (
        BigInt(updatedBalance.value) !== BigInt(0) &&
        formattedBalance !== "0.000"
      ) {
        walletTokensBalances.tokens.push({
          id: balance.token.id,
          name: balance.token.name,
          symbol: balance.token.symbol,
          decimals: parseInt(balance.token.decimals),
          balance: formattedBalance,
        });
      }
    }
    observedWallets.push(walletTokensBalances);
  }
  return observedWallets;
});
