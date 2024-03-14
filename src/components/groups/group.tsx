import {Slot, component$, JSXOutput} from "@builder.io/qwik";
import ArrowDown from "/public/images/svg/portfolio/arrowDown.svg?jsx";
import EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";
import {Structure, StructureBalance} from "~/interface/structure/Structure";
import {Token} from "~/components/groups/token";
import {formatTokenBalance} from "~/utils/formatBalances/formatTokenBalance";

export interface GroupProps {
  createdStructure: Structure
}

function extractData(createdStructure: Structure): JSXOutput[] {
  const extractedArray: {
    walletName: string;
    symbol: string;
    balance: string;
  }[] = [];

  createdStructure.structureBalance.forEach(
      (balanceEntry: StructureBalance) => {
        extractedArray.push({
          walletName: balanceEntry.wallet.name,
          symbol: balanceEntry.balance.symbol,
          balance: balanceEntry.balance.balance,
        });
      },
  );

  return extractedArray.map((entry: any) => (
      <Token
          icone="/images/svg/tokens/eth.svg"
          name={entry.name}
          symbol={entry.symbol}
          qauntity={(parseInt(formatTokenBalance(entry.balance, 2), 10) / 10000).toString()}
          value="$-"
          wallet={entry.walletName}
          network="Ethereum"
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
