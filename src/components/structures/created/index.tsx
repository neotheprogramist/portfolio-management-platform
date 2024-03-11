import { type Signal, component$, JSXOutput } from "@builder.io/qwik";
import { Structure, StructureBalance } from "~/interface/structure/Structure";

interface createdStructuresProps {
  createdStructure: Structure;
  selectedStructure: Signal<Structure | null>;
}

function extractData(createdStructure: Structure): JSXOutput[] {
  const extractedArray: {
    walletName: string;
    symbol: string;
    value: string;
  }[] = [];

  createdStructure.structureBalance.forEach(
    (balanceEntry: StructureBalance) => {
      extractedArray.push({
        walletName: balanceEntry.wallet.name,
        symbol: balanceEntry.balance.symbol,
        value: balanceEntry.balance.balance,
      });
    },
  );

  return extractedArray.map((entry: any) => (
    <div
      key={entry.value}
      class="text-lg font-bold"
    >{`${entry.value} : ${entry.symbol} - ${entry.walletName}`}</div>
  ));
}

export const CreatedStructure = component$<createdStructuresProps>(
  ({ createdStructure, selectedStructure }) => {
    return (
      <div
        class="m-2 cursor-pointer rounded bg-gray-200 p-2 shadow-md"
        onClick$={() => {
          selectedStructure.value = createdStructure;
        }}
      >
        <div class="text-lg font-bold">{createdStructure.structure.name}</div>
        {extractData(createdStructure)}
      </div>
    );
  },
);
