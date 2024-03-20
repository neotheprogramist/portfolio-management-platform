import { isAddress, getAddress, checksumAddress } from "viem";

export function isValidName(name: string): boolean {
  return name.length > 0 ? name.trim().length > 3 : true;
}

export function isValidAddress(address: string): boolean {
  return address.length > 0
    ? address.trim() !== "" && isAddress(address)
    : true;
}

export function isCheckSum(address: string): boolean {
  return (address.length > 0 && isValidAddress(address)) ? address === getAddress(address) : true;
}