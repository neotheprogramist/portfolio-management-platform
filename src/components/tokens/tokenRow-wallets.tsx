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
    console.log("imagePath", imagePath);
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
        <div class="grid grid-cols-[20%_13%_13%_14%_20%_8%_7%] items-center gap-[8px] custom-border-b-1 py-2 text-left text-[14px] text-opacity-50">
          <div class="flex items-center gap-4 py-2">
            <div class="rounded-lg custom-border-1 bg-white bg-opacity-10 p-2">
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
              {name} <span class="custom-text-50 text-xs">{symbol}</span>
            </p>
          </div>
          <div class="">
              {balance}
          </div>
          <div class="">
              ${balanceValueUSD}
          </div>
          <div class="">
              {allowance}
          </div>
          <div class="flex h-full gap-4  items-center">
            <span class="text-customGreen">
              3,6%
            </span>
            <IconGraph />
          </div>
          <div class="text-left">
            <button
              class="custom-border-1 rounded-lg p-1.5 "
              onClick$={() => {
                isTransferModalOpen.value = !isTransferModalOpen.value;
                transferredCoin.symbol = symbol;
                transferredCoin.address = address;
              }}
            >
              <span class="text-xs hover:text-blue-500">TRANSFER</span>
            </button>
          </div>

          <div class="text-right">
            <button class="custom-border-1 rounded-lg p-1">
              <IconMenuDots />
            </button>
          </div>
        </div>
      </>
    );
  },
);
