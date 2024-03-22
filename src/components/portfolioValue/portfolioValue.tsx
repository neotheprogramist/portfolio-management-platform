import { component$ } from "@builder.io/qwik";
import ImgMaximalize from "/public/images/maximize.svg?jsx";
import ImgArrowDown from "/public/images/arrowDown.svg?jsx";

export interface PortfolioValueProps {
  totalPortfolioValue: string;
}

export const PortfolioValue = component$<PortfolioValueProps>(
  ({ totalPortfolioValue }) => {
    return (
      <div class="custom-border-1 custom-bg-white custom-shadow col-start-1 col-end-3 row-span-1 row-start-1 grid grid-rows-[52px_32px_1fr] gap-[16px] overflow-auto rounded-[16px] p-[24px]">
        <div class="custom-border-b-1 flex items-center justify-between pb-[16px]">
          <h1 class="text-[20px] font-semibold">Portfolio Value</h1>
          <div class="text-right">
            <h1 class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text pb-[8px] text-[20px] font-semibold text-transparent">
              ${totalPortfolioValue}
            </h1>
            <p class="text-[12px]">
              24h change: +23,4 <span class="text-[#24A148]">+0,84%</span>
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between gap-[8px] text-[12px]">
          <div class="flex items-center gap-2">
            <h2 class="custom-text-50 uppercase">Value over time</h2>
            <div class="custom-bg-white custom-border-1 flex h-[32px] gap-[8px] rounded-[8px] p-[3.5px]">
              <button class="custom-bg-button rounded-[8px] px-[8px]">
                24h
              </button>
              <button class="rounded-[8px] px-[8px]">1W</button>
              <button class="rounded-[8px] px-[8px]">1M</button>
              <button class="rounded-[8px] px-[8px]">1Y</button>
            </div>
          </div>

          <div class="flex items-center gap-[8px]">
            <h2 class="custom-text-50 uppercase lg:hidden">Portfolio</h2>
            <button class="custom-bg-white custom-border-1 flex h-[32px] items-center gap-[8px] rounded-[8px] px-[8px]">
              <p>All</p>
              <ImgArrowDown />
            </button>
            <button class="custom-bg-white custom-border-1 h-[32px] items-center rounded-[8px] px-[8px]">
              <ImgMaximalize />
            </button>
          </div>
        </div>

        <div class=""></div>
      </div>
    );
  },
);
