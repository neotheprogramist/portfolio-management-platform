import { component$ } from "@builder.io/qwik";
import { PortfolioValue } from "~/components/portfolioValue/portfolioValue";
import { Alert } from "~/components/alerts/alert";
import { Action } from "~/components/actions/action";
import { TokenRow } from "~/components/tokens/tokenRow";
import ImgWarning from "/public/images/warning.svg?jsx";

export default component$(() => {
  return (
    <div class="grid grid-cols-4 grid-rows-[384px_1fr] gap-6 overflow-auto border-t border-white border-opacity-15 p-6">
      <PortfolioValue />
      <div class="border-white-opacity-20 bg-glass col-start-3 row-span-1 row-start-1 rounded-3xl p-4">
        <div class="mb-4 flex items-center justify-between text-white">
          <h1 class="text-xl font-semibold">Alerts</h1>
          <button class="border-buttons rounded-3xl px-4 py-2 font-semibold">
            See All
          </button>
        </div>
        <div class="h-72 overflow-scroll text-white">
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
          <Alert />
        </div>
      </div>
      <div class="border-white-opacity-20 bg-glass col-start-4 row-span-1 row-start-1 rounded-3xl p-4 shadow">
        <div class="mb-4 flex items-center justify-between text-white">
          <h1 class="text-xl font-semibold">Actions</h1>
          <button class="border-buttons rounded-3xl px-4 py-2 font-semibold">
            See All
          </button>
        </div>
        <div class="h-72 overflow-scroll text-white">
          <Action />
          <Action />
          <div class="flex justify-between border-b border-white border-opacity-20 py-5">
            <div class="">
              <h3 class="text-sm">DCA</h3>
              <p class="text-xs text-white text-opacity-50">1 day ago</p>
            </div>
            <div class="bg-glass flex items-center gap-1 rounded-lg border border-yellow-400 p-2">
              <ImgWarning />
              <p class="text-sm text-yellow-400">Warning</p>
            </div>
          </div>
          <Action />
          <Action />
          <Action />
        </div>
      </div>
      <div class="border-white-opacity-20 bg-glass col-start-1 col-end-5 row-span-1 row-start-2 grid grid-rows-[64px_1fr] overflow-auto rounded-3xl p-4">
        <div class="row-span-1 row-start-1 mb-6 flex items-center justify-between">
          <h1 class="text-xl font-semibold text-white">Favourite Tokens</h1>
          <button class="border-buttons rounded-3xl px-4 py-2 text-xs font-semibold text-white">
            Go To Portfolio
          </button>
        </div>
        <div class="row-span-1 row-start-2 h-full overflow-auto">
          <table class="w-full overflow-auto text-left">
            <thead>
              <tr class="text-white text-opacity-50">
                <td>TOKEN NAME</td>
                <td>QUANTITY</td>
                <td>VALUE</td>
                <td class="flex items-center justify-center gap-4">
                  CHANGE
                  <div class="bg-glass flex gap-1 rounded-lg border border-white border-opacity-20 p-1 text-white ">
                    <button class="color-gradient rounded-lg p-2">24h</button>
                    <button class="p-2">3d</button>
                    <button class="p-2">30d</button>
                  </div>
                </td>
                <td>WALLET</td>
                <td>NETWORK</td>
                <td>SUBPORTFOLIO</td>
                <td></td>
              </tr>
            </thead>
            <tbody class="overflow-auto">
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
              <TokenRow />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
