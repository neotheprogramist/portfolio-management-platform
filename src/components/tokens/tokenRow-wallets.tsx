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
  allowance: string
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
    allowance
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
        <div class="grid grid-cols-[28%_12%_12%_12%_14%_8%_9%] items-center gap-[8px] border-b border-white border-opacity-10 py-[16px] text-left text-[14px] text-white text-opacity-50">
          <div class="flex items-center gap-4 py-2">
            <div class="rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 p-2">
              <Image
                layout="constrained"
                objectFit="fill"
                width={24}
                height={24}
                alt={`${name} logo`}
                src={imagePath}
              />
            </div>
            <p class="text-white">
              {name} <span class="text-white text-opacity-50">{symbol}</span>
            </p>
          </div>
          <div class="">
            <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white ">
              {balance}
            </span>
          </div>
          <div class="">
            <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
              ${balanceValueUSD}
            </span>
          </div>
          <div class="">
            <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
              {allowance}
            </span>
          </div>
          <div class="flex justify-center gap-[16px]">
            <span class="bg-glass rounded-lg border border-green-500 bg-green-500 px-2 py-1 text-green-500">
              0%
            </span>
            <IconGraph />
          </div>
          <div class="text-right">
            <button
              class="border-white-opacity-20 bg-glassp rounded-lg p-1.5  "
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
            <button class="border-white-opacity-20 bg-glassp rounded-lg p-1.5">
              <IconMenuDots />
            </button>
          </div>
        </div>
      </>
    );
  },
);
