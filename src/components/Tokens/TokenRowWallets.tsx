import { $, type Signal, component$ } from "@builder.io/qwik";
import IconMenuDots from "/public/assets/icons/menu-dots.svg?jsx";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import {
  Image,
  type ImageTransformerProps,
  useImageProvider,
} from "qwik-image";
import { type transferredCoinInterface } from "~/routes/app/wallets";
type TokenRowWalletsProps = {
  name: string;
  symbol: string;
  balance: string;
  imagePath: string;
  balanceValueUSD: string;
  isTransferModalOpen: Signal<boolean>;
  address: string;
  transferredCoin: transferredCoinInterface;
  allowance: string;
};

export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({
    name,
    symbol,
    address,
    balance,
    imagePath,
    balanceValueUSD,
    isTransferModalOpen,
    transferredCoin,
    allowance,
  }) => {
    const imageTransformer$ = $(
      ({ src, width, height }: ImageTransformerProps): string => {
        return `${src}?height=${height}&width=${width}&format=webp&fit=fill`;
      },
    );

    useImageProvider({
      resolutions: [1920, 1280],
      imageTransformer$,
    });
    return (
      <>
        <div class="custom-border-b-1 grid grid-cols-[22%_15%_15%_15%_15%_15%] items-center gap-2 py-2 text-sm">
          <div class="flex items-center gap-4 py-2">
            <div class="custom-border-1 rounded-lg p-[10px]">
              <Image
                layout="constrained"
                objectFit="fill"
                width={24}
                height={24}
                alt={`${name} logo`}
                src={imagePath}
              />
            </div>
            <p class="">
              {name} <span class="custom-text-50 pl-1 text-xs">{symbol}</span>
            </p>
          </div>
          <div class="overflow-auto">{balance}</div>
          <div class="overflow-auto">${balanceValueUSD}</div>
          <div class="">{allowance}</div>
          <div class="flex h-full items-center gap-4">
            <span class="text-customGreen">3,6%</span>
            <IconGraph />
          </div>
          <div class="text-left">
            <button
              class=""
              onClick$={() => {
                isTransferModalOpen.value = !isTransferModalOpen.value;
                transferredCoin.symbol = symbol;
                transferredCoin.address = address;
              }}
            >
              <span class="text-xs hover:text-blue-500">TRANSFER</span>
            </button>
          </div>

          {/* <div class="text-right">
            <button class="">
              <IconMenuDots />
            </button>
          </div> */}
        </div>
      </>
    );
  },
);
