import { formatEther } from "viem";

export const formatNativeBalance = (nativeBalance: bigint): string => {
  return parseFloat(formatEther(nativeBalance)).toFixed(3);
};
