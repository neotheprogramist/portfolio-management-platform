import { Slot, component$, type JSXOutput } from "@builder.io/qwik";
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
      key={`token_${index}`}
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
              class="icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick$={props.onClick$}
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z"
                fill="black"
              />
            </svg>
            {/*<EditIcon onClick$={() => console.log('click click')}></EditIcon>*/}
          </div>
        </div>
        <Slot />
      </div>
      {extractData(props.createdStructure, props.tokenStore)}
    </>
  );
});
