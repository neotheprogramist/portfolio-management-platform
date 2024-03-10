import { type Signal, component$, JSXOutput } from "@builder.io/qwik";
import { StructureBalance } from "~/interface/structure/Structure";
import { TokenWithBalance } from "~/interface/walletsTokensBalances/walletsTokensBalances";

interface createdStructuresProps {
  createdStructure: StructureBalance;
  selectedStructure: Signal<StructureBalance | null>;
}

function aggregateTokenBalances(createdStructure: StructureBalance): JSXOutput[] {
  const aggregatedTokens: { [tokenId: string]: TokenWithBalance } = {};

  createdStructure.tokens.forEach((token) => {
    const tokenId = token.id;

    if (aggregatedTokens[tokenId]) {
      aggregatedTokens[tokenId].balance = (
        BigInt(aggregatedTokens[tokenId].balance) + BigInt(token.balance)
      ).toString();
    } else {
      aggregatedTokens[tokenId] = {
        id: tokenId,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        balance: token.balance,
      };
    }
  });

  const result: TokenWithBalance[] = Object.values(aggregatedTokens);

  return result.map((token) => (
    <div class="text-lg font-bold">{`${token.symbol} - ${token.balance}`}</div>
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
        {aggregateTokenBalances(createdStructure)}
      </div>
    );
  },
);
