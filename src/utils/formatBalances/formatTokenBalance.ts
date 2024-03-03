export const formatTokenBalance = (
  balance: string,
  decimals: number,
): string => {
  const formattedBalance = BigInt(balance) / BigInt(10 ** decimals);
  const remainder = (BigInt(balance) % BigInt(10 ** decimals))
    .toString()
    .padStart(decimals, "0")
    .slice(0, 3);
  return `${formattedBalance}.${remainder}`;
};
