import { component$ } from "@builder.io/qwik";
import ImgMaximalize from "/public/images/maximize.svg?jsx";
import ImgArrowDown from "/public/images/arrowDown.svg?jsx";

export interface PortfolioValueProps {
  totalPortfolioValue: string;
}

export const PortfolioValue = component$<PortfolioValueProps>(
  ({ totalPortfolioValue }) => {
    return (
      <div class="border-white-opacity-20 bg-glass col-start-1 col-end-3 row-span-1 row-start-1 grid grid-rows-[52px_32px_1fr] gap-4 overflow-auto rounded-[16px] p-[24px] shadow">
        <div class="flex items-center justify-between border-b border-white border-opacity-20 pb-[16px]">
          <h1 class="text-xl font-semibold text-white">Portfolio Value</h1>
          <div class="block justify-around text-right">
            <h1 class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text text-xl font-semibold text-transparent">
              ${totalPortfolioValue}
            </h1>
            <p class="text-xs text-white">
              24h change: +23,4 <span class="text-green-500">+0,84%</span>
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between gap-[8px] text-xs">
          <div class="flex items-center gap-2">
            <h2 class="uppercase text-gray-500">Value over time</h2>
            <div class="bg-glass border-white-opacity-20 flex h-[32px] gap-[8px] rounded-lg p-[2px] text-white">
              <button class="color-gradient rounded-lg px-[8px]">Hour</button>
              <button class="px-[8px]">Day</button>
              <button class="px-[8px]">Month</button>
              <button class="px-[8px]">Year</button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <h2 class="uppercase text-gray-500 lg:hidden">Portfolio</h2>
            <button class="bg-glass border-white-opacity-20 flex h-[32px] items-center gap-[8px] rounded-lg px-[8px] ">
              <p class="text-white">All</p>
              <ImgArrowDown />
            </button>
            <button class="bg-glass border-white-opacity-20 h-[32px] items-center rounded-lg px-[8px]">
              <ImgMaximalize />
            </button>
          </div>
        </div>
        <div class=""></div>
      </div>
    );
  },
);
