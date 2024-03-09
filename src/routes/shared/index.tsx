import { routeLoader$ } from "@builder.io/qwik-city";
import { connectToDB } from "~/utils/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { Wallet } from "~/interface/auth/Wallet";
import { contractABI, publicClient } from "~/abi/abi";
import type { WalletTokensBalances } from "~/interface/walletsTokensBalances/walletsTokensBalances";
import type { Token } from "~/interface/token/Token";
import type { Balance } from "~/interface/balance/Balance";
import { formatTokenBalance } from "~/utils/formatBalances/formatTokenBalance";

export const useObservedWallets = routeLoader$(async (requestEvent) => {
  const db = await connectToDB(requestEvent.env);

  const cookie = requestEvent.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;

  const [result]: any = await db.query(
    `SELECT ->observes_wallet.out FROM ${userId};`,
  );
  if (!result) throw new Error("No observed wallets");
  const observedWalletsQueryResult = result[0]["->observes_wallet"].out;

  const observedWallets: any[] = [];
  for (const observedWallet of observedWalletsQueryResult) {
    const [wallet] = await db.select<Wallet>(`${observedWallet}`);
    const nativeBalance = await publicClient.getBalance({
      address: wallet.address as `0x${string}`,
      blockTag: "safe",
    });
    await db.query(
      `UPDATE ${observedWallet} SET nativeBalance = '${nativeBalance}';`,
    );

    const walletTokensBalances: WalletTokensBalances = {
      wallet: {
        id: wallet.id,
        name: wallet.name,
        chainId: wallet.chainId,
        address: wallet.address,
        nativeBalance: nativeBalance,
      },
      tokens: [],
    };

    // For each token update balance
    const tokens = await db.select<Token>("token");
    for (const token of tokens) {
      const readBalance = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: contractABI,
        functionName: "balanceOf",
        args: [wallet.address as `0x${string}`],
      });

      // Certain balance which shall be updated
      const [[balanceToUpdate]]: any = await db.query(
        `SELECT * FROM balance WHERE ->(for_wallet WHERE out = '${wallet.id}') AND ->(for_token WHERE out = '${token.id}');`,
      );

      await db.update<Balance>(`${balanceToUpdate.id}`, {
        value: readBalance.toString(),
      });

      const formattedBalance = formatTokenBalance(
        readBalance.toString(),
        token.decimals,
      );

      if (readBalance !== BigInt(0) && formattedBalance !== "0.000") {
        // Add the token to the wallet object
        walletTokensBalances.tokens.push({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          balance: formattedBalance,
        });
      }
    }
    observedWallets.push(walletTokensBalances);
  }
  // console.log(observedWallets);
  return observedWallets;
});
