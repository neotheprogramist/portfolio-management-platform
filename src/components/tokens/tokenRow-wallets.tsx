import { $, component$ } from "@builder.io/qwik";
import ImgMore from "/public/images/svg/more.svg?jsx";
import ImgGraf from "/public/images/svg/graf.svg?jsx";
import {
  Image,
  type ImageTransformerProps,
  useImageProvider,
} from "qwik-image";
type TokenRowWalletsProps = {
  name: string;
  symbol: string;
  balance: string;
  imagePath: string;
  balanceValueUSD: string;
};

export const TokenRowWallets = component$<TokenRowWalletsProps>(
  ({ name, symbol, balance, imagePath, balanceValueUSD }) => {
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
        <div class="custom-border-b-1 custom-text-50 grid grid-cols-[30%_14%_14%_28%_9%] items-center gap-[8px] py-[16px] text-left text-[14px]">
          <div class="flex items-center gap-4 py-2">
            <div class="custom-border-1 rounded-lg bg-white bg-opacity-10 p-2">
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
              {name} <span class="custom-text-50">{symbol}</span>
            </p>
          </div>
          <div class="">
            <span class="custom-bg-white custom-border-1 rounded-lg px-2 py-1 text-white ">
              {balance}
            </span>
          </div>
          <div class="">
            <span class="custom-bg-white custom-border-1 rounded-lg px-2 py-1 text-white">
              ${balanceValueUSD}
            </span>
          </div>
          <div class="flex justify-center gap-[16px]">
            <span class="custom-bg-white rounded-lg border border-green-500 bg-green-500 px-2 py-1 text-green-500">
              0%
            </span>
            <ImgGraf />
          </div>
          <div class="text-right">
            <button class="custom-border-1 custom-bg-white rounded-lg p-1.5">
              <ImgMore />
            </button>
          </div>
        </div>
      </>
    );
  },
);
