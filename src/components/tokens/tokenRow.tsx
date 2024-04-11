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
      <div
        style="grid-template-columns: minmax(200px, 500px) minmax(100px, 300px) minmax(150px, 300px) minmax(250px, 400px) repeat(2, minmax(120px, 400px)) minmax(100px, 400px) 40px;"
        class="custom-border-b-1 grid h-[68px] items-center gap-2 text-sm font-normal"
      >
        <div class="flex items-center gap-4">
          <div class="custom-border-1 rounded-lg bg-white bg-opacity-10 p-2">
            <Image
              layout="constrained"
              objectFit="fill"
              width={24}
              height={24}
              alt={`${tokenName} logo`}
              src={imagePath}
            />
          </div>
          <p class="text-sm">
            {tokenName}{" "}
            <span class="custom-text-50 text-xs">{tokenSymbol}</span>
          </p>
        </div>
        <div class="flex h-full items-center overflow-auto">{quantity}</div>
        <div class="">${value}</div>
        <div class="flex gap-4 text-customGreen">
          +3,36%
          <IconGraph />
        </div>
        <div class="">{wallet}</div>
        <div class="">{networkName}</div>
        <div class="">{subportfolio}</div>
        <div class="flex justify-end">
          <IconStar />
        </div>
      </div>
    );
  },
);
