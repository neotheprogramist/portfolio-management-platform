import {Slot, component$, JSXOutput} from "@builder.io/qwik";
import ArrowDown from "/public/images/svg/portfolio/arrowDown.svg?jsx";
import EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";
import {Structure, StructureBalance} from "~/interface/structure/Structure";
import {Token} from "~/components/groups/token";
import {formatTokenBalance} from "~/utils/formatBalances/formatTokenBalance";
import {chainIdToNetworkName} from "~/utils/chains";

export interface GroupProps {
  createdStructure: Structure
}

function extractData(createdStructure: Structure): JSXOutput[] {

  const extractedArray: {
    walletName: string;
    symbol: string;
    quantity: string
      networkName: string
      value: number
  }[] = [];

  createdStructure.structureBalance.forEach(
      (balanceEntry ) => {
          console.log(balanceEntry)
        extractedArray.push({
          walletName: balanceEntry.wallet.name,
            networkName: chainIdToNetworkName[balanceEntry.wallet.chainId.toString()],
          symbol: balanceEntry.balance.symbol,
          quantity: formatTokenBalance(balanceEntry.balance.balance, balanceEntry.balance.decimals),
            value: 0
        });
      },
  );

  return extractedArray.map((entry: any) => (
      <Token
          icone={`/images/svg/tokens/${entry.symbol}.svg`}
          name={entry.name}
          symbol={entry.symbol}
          qauntity={entry.quantity}
          value="$-"
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
