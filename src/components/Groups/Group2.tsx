import { component$, type JSXOutput } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import {
  type Structure,
  type StructureBalance,
} from "~/interface/structure/Structure";
import { TokenRow } from "~/components/Groups/TokenRow2";
import { convertWeiToQuantity } from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";
import IconDelete from "/public/assets/icons/delete-white.svg?jsx";

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
        quantity: convertWeiToQuantity(
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
    <TokenRow
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
        <div class="flex gap-6 text-sm">
          <div class="flex items-center gap-2">
            <IconArrowDown />
            <h3>{props.createdStructure.structure.name}</h3>
            <IconDelete />
          </div>
          <button class="custom-border-2 rounded-3xl px-4 py-2 text-xs">
            See Performance
          </button>
        </div>
        <div>{extractData(props.createdStructure, props.tokenStore)}</div>
      </div>
    </>
  );
});
