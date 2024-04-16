export const convertWeiToQuantity = (
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

export const getTotalValueChange = (
  valueChange: { valueChangeUSD: string; percentageChange: string }[],
) => {
  let totalValueChange = 0;

  valueChange.forEach((obj) => {
    totalValueChange += parseFloat(obj.valueChangeUSD);
  });

  return totalValueChange;
};

export const getProperTotalValueChange = (
  firstEntry: number,
  lastEntry: number,
): number => lastEntry - firstEntry;

export const getPercentageOfTotalValueChange = (
  firstEntryValue: number,
  totalValueChange: number,
): number => {
  if (firstEntryValue != 0) {
    return (totalValueChange / firstEntryValue) * 100;
  }
  return 100;
};
