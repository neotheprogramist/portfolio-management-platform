import { component$, type JSXOutput } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import {
  type Structure,
  type StructureBalance,
} from "~/interface/structure/Structure";
import { Token } from "~/components/groups/token";
import { formatTokenBalance } from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";

export interface GroupProps {
  createdStructure: Structure;
  onClick$?: QRL<() => void>;
  tokenStore: { balanceId: string; structureId: string };
}

function extractData(
  createdStructure: Structure,
  tokenStore: { balanceId: string; structureId: string },
): JSXOutput[] {
  const extractedArray: {
    walletName: string;
    symbol: string;
    quantity: string;
    networkName: string;
    value: string;
    balanceId: string;
    structureId: string;
  }[] = [];

  createdStructure.structureBalance.forEach(
    (balanceEntry: StructureBalance) => {
      extractedArray.push({
        walletName: balanceEntry.wallet.name,
        networkName:
          chainIdToNetworkName[balanceEntry.wallet.chainId.toString()],
        symbol: balanceEntry.balance.symbol,
        quantity: formatTokenBalance(
          balanceEntry.balance.balance,
          balanceEntry.balance.decimals,
        ),
        value: balanceEntry.balance.balanceValueUSD,
        balanceId: balanceEntry.balance.balanceId as string,
        structureId: createdStructure.structure.id as string,
      });
    },
  );

  return extractedArray.map((entry: any, index: number) => (
    <Token
      key={`${entry.balanceId} - ${index}`}
      icon={`/assets/icons/tokens/${entry.symbol.toLowerCase()}.svg`}
      name={entry.name}
      symbol={entry.symbol}
      quantity={entry.quantity}
      value={`$${(entry.value * entry.quantity).toFixed(2)}`}
      wallet={entry.walletName}
      network={entry.networkName}
      onClick$={() => {
        tokenStore.balanceId = entry.balanceId;
        tokenStore.structureId = entry.structureId;
      }}
    />
  ));
}

export const Group = component$<GroupProps>((props) => {
  return (
    <>
      <div>
        <div class="flex h-[50px] pb-[8px] pt-[24px] text-[14px]">
          <div class="flex items-center gap-[8px] ">
            <IconArrowDown />
            <h3>{props.createdStructure.structure.name}</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              onClick$={props.onClick$}
            >
              <path
                d="M2.91667 11.0833H3.74792L9.45 5.38125L8.61875 4.55L2.91667 10.2521V11.0833ZM1.75 12.25V9.77083L9.45 2.08542C9.56667 1.97847 9.69549 1.89583 9.83646 1.8375C9.97743 1.77917 10.1257 1.75 10.2812 1.75C10.4368 1.75 10.5875 1.77917 10.7333 1.8375C10.8792 1.89583 11.0056 1.98333 11.1125 2.1L11.9146 2.91667C12.0312 3.02361 12.1163 3.15 12.1698 3.29583C12.2233 3.44167 12.25 3.5875 12.25 3.73333C12.25 3.88889 12.2233 4.03715 12.1698 4.17812C12.1163 4.3191 12.0312 4.44792 11.9146 4.56458L4.22917 12.25H1.75ZM9.02708 4.97292L8.61875 4.55L9.45 5.38125L9.02708 4.97292Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
        <div>{extractData(props.createdStructure, props.tokenStore)}</div>
      </div>
    </>
  );
});
