import { Slot, component$, JSXOutput } from "@builder.io/qwik";
import ArrowDown from "/public/images/svg/portfolio/arrowDown.svg?jsx";
import EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";
import { Structure, StructureBalance } from "~/interface/structure/Structure";
import { Token } from "~/components/groups/token";
import { formatTokenBalance } from "~/utils/formatBalances/formatTokenBalance";
import { chainIdToNetworkName } from "~/utils/chains";

export interface GroupProps {
  createdStructure: Structure;
}

function extractData(createdStructure: Structure): JSXOutput[] {
  const extractedArray: {
    walletName: string;
    symbol: string;
    quantity: string;
    networkName: string;
    value: string;
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
      });
    },
  );

  return extractedArray.map((entry: any) => (
    <Token
      icon={`/images/svg/tokens/${entry.symbol.toLowerCase()}.svg`}
      name={entry.name}
      symbol={entry.symbol}
      quantity={entry.quantity}
      value={`$${(entry.value * entry.quantity).toFixed(2)}`}
      wallet={entry.walletName}
      network={entry.networkName}
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
            <EditIcon />
          </div>
        </div>
        <Slot />
      </div>
      {extractData(props.createdStructure)}
    </>
  );
});