import { component$, Slot } from "@builder.io/qwik";
import ImgMaximalize from "/public/images/maximize.svg?jsx";
import ImgArrowDown from "/public/images/arrowDown.svg?jsx";

export const PortfolioValue = component$(() => {
  return (
    <>
      <div class="border-white-opacity-20 bg-glass col-start-1 col-end-3 row-span-1 row-start-1 flex flex-col gap-4 rounded-3xl p-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-white">Portfolio Value</h1>
          <div class="block justify-around text-right">
            <Slot />
            <h1 class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text text-xl font-semibold text-transparent">
              $32 311,00
            </h1>
            <p class="mt-1 text-xs text-white">
              24h change: +23,4 <span class="text-green-500">+0,84%</span>
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between border-t border-white border-opacity-20 pt-4">
          <div class="flex items-center gap-2">
            <h2 class="uppercase text-gray-500">Value over time</h2>
            <div class="flex gap-1 rounded-lg border border-white border-opacity-20 bg-white bg-opacity-10 p-1 text-white">
              <button class="color-gradient rounded-lg p-2">Hour</button>
              <button class="p-2">Day</button>
              <button class="p-2">Month</button>
              <button class="p-2">Year</button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <h2 class="uppercase text-gray-500">Portfolio</h2>
            <button class="flex gap-1 rounded-lg border-2 border-white border-opacity-20 bg-white bg-opacity-10 p-2">
              <p class="text-white">All</p>
              <ImgArrowDown />
            </button>
            <button class="rounded-lg border-2 border-white border-opacity-20 bg-white bg-opacity-10 p-2.5">
              <ImgMaximalize />
            </button>
          </div>
        </div>
        <div class=""></div>
      </div>
    </>
  );
});
