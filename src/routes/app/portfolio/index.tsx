import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/portfolio/button-master/button";
import EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";
import Graph from "/public/images/chart.png?jsx";
import Bitcoin from "/public/images/svg/portfolio/btc.svg?jsx";
import ArrowDown from "/public/images/svg/portfolio/arrowDown.svg?jsx";

export default component$(() => {
  return (
    <>
      <div class="grid grid-rows-[64px_auto] overflow-auto bg-[#F4F4F4] px-[20px] text-black">
        <div class="flex h-[64px] items-center justify-between">
          <div class="flex min-w-[158px] items-center gap-2 text-xl">
            <span>Portfolio name</span>
            <EditIcon />
          </div>
          <div class="flex items-center justify-end gap-2">
            <Button
              image="/images/svg/portfolio/report-data.svg"
              text="Generate report"
              newClass="min-w-[143px]"
            />
            <Button
              image="/images/svg/portfolio/rebalance.svg"
              text="Rebalance"
              newClass="min-w-[108px]"
            />
            <Button
              image="/images/svg/portfolio/dca.svg"
              text="DCA"
              newClass="min-w-[68px]"
            />
            <Button
              image="/images/svg/portfolio/structures.svg"
              text="See all structures"
              newClass="min-w-[153px]"
            />
            <Button
              image="/images/svg/portfolio/add.svg"
              text="Create new structure"
              newClass="bg-[#0C63E9] text-white min-w-[175px]"
            />
          </div>
        </div>
        <div class="grid grid-cols-[2fr_1fr] gap-[10px] overflow-auto pb-[20px]">
          <div class="flex min-h-[200px] min-w-[580px] flex-col gap-[20px] overflow-auto rounded-lg bg-white p-[20px]">
            <div>
              <p class="text-base">Token list</p>
            </div>
            <div class="flex gap-2">
              <Button
                image="/images/svg/portfolio/search.svg"
                text="Search for name"
                newClass="min-w-[240px] justify-start pl-[6px] text-[#A8A8A8]"
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Subportfolio"
                newClass="min-w-[118px] flex-row-reverse"
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Wallet"
                newClass="min-w-[80px] flex-row-reverse "
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Network"
                newClass="min-w-[94px] flex-row-reverse"
              />
            </div>
            {/* <div class="overflow-auto">
                        <div class="text-[10px] h-[40px] px-[20px] flex justify-between items-center gap-[8px]">
                            <p class="text-opacity-50 min-w-[200px]">TOKEN NAME</p>
                            <p class="text-opacity-50 min-w-[100px]">QANTITY</p>
                            <p class="text-opacity-50 min-w-[145px]">VALUE</p>
                            <div class="min-w-[145px] flex items-center gap-[8px]">
                                <p class="text-opacity-50 min-w-[40px]">CHANGE</p>
                                <div class="flex items-center justify-center bg-[#F0F0F0] w-[80px] h-[20px] rounded-sm ">
                                    <button class="w-[25px] h-[16px] bg-white rounded-sm">24h</button>
                                    <button class="w-[25px] h-[16px] text-[#A7A7A7]">3d</button>
                                    <button class="w-[25px] h-[16px] text-[#A7A7A7]">30d</button>
                                </div>
                            </div>
                            <p class="text-opacity-50 min-w-[145px]">WALLET</p>
                            <p class="text-opacity-50 min-w-[145px]">NETWORK</p>
                        </div>
                        <div class="flex justify-between items-center border-b-[1px] border-opacity-50 border-gray-500"></div>
                    </div> */}
            <table class="overflow-auto">
              <thead class="">
                <tr class="h-[40px] overflow-auto text-[10px] font-normal text-[#222222]  text-opacity-[50%]">
                  <td class="pl-[20px]">TOKEN NAME</td>
                  <td class="">QUANTITY</td>
                  <td class="">VALUE</td>
                  <td class="flex h-[40px] items-center gap-[8px]">
                    CHANGE
                    <div class="flex h-[20px] w-[80px] items-center justify-center rounded-sm bg-[#F0F0F0] ">
                      <button class="h-[16px] w-[25px] rounded-sm bg-white">
                        24h
                      </button>
                      <button class="h-[16px] w-[25px] text-[#A7A7A7]">
                        3d
                      </button>
                      <button class="h-[16px] w-[25px] text-[#A7A7A7]">
                        30d
                      </button>
                    </div>
                  </td>
                  <td class="">WALLET</td>
                  <td class="">NETWORK</td>
                </tr>
              </thead>
              <tbody class="overflow-auto border-t-[1px] border-gray-500 border-opacity-50 text-black">
                <tr class="flex h-[50px] pb-[8px] pt-[24px] text-[14px]">
                  <td class="flex items-center gap-[8px] ">
                    <ArrowDown />
                    <span>Investment</span>
                    <EditIcon />
                  </td>
                </tr>
                {/* <tr class="h-[56px]">
                  <td class="ml-[20px] flex h-[56px] w-[200px] items-center gap-[6px] overflow-auto">
                    <div class="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#E6E6E6]">
                      <Bitcoin width={32} height={32} class="min-w-[32px]" />
                    </div>
                    <div class="flex items-end gap-[6px]">
                      <p class="overflow-auto text-[14px]">Wrapped Bitcoin</p>
                      <span class="text-[10px] text-[#22222280] text-opacity-[50%]">
                        WBTC
                      </span>
                    </div>
                  </td>
                  <td class="min-w-[100px] overflow-auto">
                    <span class="font-normal">427</span>
                  </td>
                  <td class="min-w-[145px] overflow-auto">
                    <span class="font-medium">$82 617,96 </span>
                  </td>
                  <td class="min-w-[175px] overflow-auto">
                    <span class="font-medium">H</span>
                  </td>
                  <td class="min-w-[145px] overflow-auto">
                    <span class="font-medium">H</span>
                  </td>
                  <td class="min-w-[145px] overflow-auto">
                    <span class="font-medium">H</span>
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>
          <div class="flex min-w-[440px] flex-col gap-[25px] overflow-auto rounded-lg bg-white p-[20px]">
            <div class="flex h-[32px] items-center justify-between gap-[5px]">
              <p class="text-base">Details</p>
              <div class="flex gap-[5px]">
                <Button
                  image="/images/svg/portfolio/rebalance.svg"
                  text="Rebalance"
                  newClass="min-w-[116px]"
                />
                <Button
                  image="/images/svg/portfolio/rebalance.svg"
                  text="Rebalance"
                  newClass="min-w-[116px]"
                />
              </div>
            </div>
            <div class="flex h-[64px] items-center gap-[16px]">
              <div class="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-[#E6E6E6]">
                <Bitcoin width={40} height={40} class="min-w-[40px]" />
              </div>
              <div class="flex flex-col gap-[4px]">
                <h4 class="text-[18px]">Wrapped Bitcoin</h4>
                <p class="text-xs text-[#222222] text-opacity-50">WBTC</p>
              </div>
            </div>
            <div class="flex flex-col gap-[20px]">
              <p class="mt-[11px] text-[18px]">$82 617,96</p>
              <div class="flex gap-[12px] text-sm">
                <p>TRANSFER</p>
                <p>RECEIVE</p>
              </div>
              <div class="grid h-[32px] w-[398px] grid-cols-4 items-center rounded-[4px] bg-[#F0F0F0] text-[10px] text-[#A7A7A7]">
                <button class="h-[28px]">Hour</button>
                <button class="h-[28px]  rounded-sm bg-white text-black">
                  Day
                </button>
                <button class="h-[28px] ">Month</button>
                <button class="h-[28px]">Year</button>
              </div>
              <div class="">
                <Graph class="min-w-[400px]" />
              </div>
            </div>
            <div class="mt-[28px] flex min-w-[370px] flex-col gap-[20px]">
              <h4 class="text-base font-medium">Market data</h4>
              <p class="font-regular text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                magna diam, dapibus sed justo ac, pretium aliquet augue. Sed sit
                amet vulputate felis, vel bibendum ligula. Cras sed erat libero.
                Curabitur pretium, sem vitae scelerisque euismod, metus arcu
                pretium tellus, ac interdum enim felis vitae diam. Vivamus quis
                lacinia justo, in porttitor massa. Suspendisse blandit ex sed
                gravida malesuada. Nam eleifend at dui non viverra. Nullam ut
                congue odio. Curabitur ac turpis ipsum. Nulla vel eros
                scelerisque, vehicula diam vitae, cursus eros. Donec et turpis
                eget sapien faucibus placerat quis vel mauris. Mauris ultricies
                eget sem eu semper. Aenean non viverra dui. Curabitur placerat
                risus at leo ornare mollis
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
