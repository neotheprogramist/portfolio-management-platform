import { $, component$ } from "@builder.io/qwik";
import IconStar from "/public/assets/icons/dashboard/star.svg?jsx";
import IconGraph from "/public/assets/icons/graph.svg?jsx";
import {
  useImageProvider,
  type ImageTransformerProps,
  Image,
} from "qwik-image";

export interface TokenRowProps {
  tokenName?: string;
  tokenSymbol?: string;
  quantity?: string;
  value?: string;
  wallet?: string;
  networkName?: string;
  subportfolio?: string;
  imagePath?: string;
}

export const TokenRow = component$<TokenRowProps>(
  ({
    tokenName,
    tokenSymbol,
    quantity,
    value,
    wallet,
    networkName,
    subportfolio,
    imagePath,
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
      <div class="grid grid-cols-[17%_8%_11%_20%_14%_11%_12%_3%] items-center gap-[8px] border-b border-white border-opacity-10 py-[16px] text-left text-[14px]">
        <div class="flex items-center gap-4 py-2">
          <div class="rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 p-2">
            <Image
              layout="constrained"
              objectFit="fill"
              width={24}
              height={24}
              alt={`${tokenName} logo`}
              src={imagePath}
            />
          </div>
          <p class="text-white">
            {tokenName}{" "}
            <span class="text-white text-opacity-50">{tokenSymbol}</span>
          </p>
        </div>
        <div class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white ">
            {quantity}
          </span>
        </div>
        <div class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            ${value}
          </span>
        </div>
        <div class="flex justify-center gap-[16px]">
          <span class="bg-glass rounded-lg border border-green-500 bg-green-500 px-2 py-1 text-green-500">
            +3,36%
          </span>
          <IconGraph />
        </div>
        <div class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            {wallet}
          </span>
        </div>
        <div class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            {networkName}
          </span>
        </div>
        <div class="">
          <span class="bg-glass rounded-lg border border-white border-opacity-20 px-2 py-1 text-white">
            {subportfolio}
          </span>
        </div>
        <div class="flex justify-end">
          <IconStar />
        </div>
      </div>
    );
  },
);
