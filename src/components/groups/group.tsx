import { component$, type JSXOutput } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import ArrowDown from "/public/images/svg/portfolio/arrowDown.svg?jsx";
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
      icon={`/images/svg/tokens/${entry.symbol.toLowerCase()}.svg`}
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
            <ArrowDown />
            <h3>{props.createdStructure.structure.name}</h3>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick$={props.onClick$}
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.5375 1.1375L11.1125 2.7125C11.4625 3.0625 11.4625 3.5875 11.1125 3.9375L4.55 10.5H1.75V7.7L8.3125 1.1375C8.6625 0.7875 9.1875 0.7875 9.5375 1.1375ZM10.5 3.325L8.925 1.75L7.6125 3.0625L9.1875 4.6375L10.5 3.325ZM2.625 8.05V9.625H4.2L8.575 5.25L7 3.675L2.625 8.05ZM0.875 12.25V11.375H13.125V12.25H0.875Z"
                fill="#222222"
                fill-opacity="0.5"
              />
            </svg>
          </div>
        </div>
        <div>
          {extractData(props.createdStructure)}
        </div>
      </div>
      {extractData(props.createdStructure, props.tokenStore)}
    </>
  );
});
