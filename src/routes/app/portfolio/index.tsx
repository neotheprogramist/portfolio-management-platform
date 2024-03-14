import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/portfolio/button-master/button";
import EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";
import Graph from "/public/images/chart.png?jsx";
import Bitcoin from "/public/images/svg/portfolio/btc.svg?jsx";
import { Group } from "~/components/groups/group";
import { Token } from "~/components/groups/token";


export default component$(() => {
  return (
    <>
      <div class="grid grid-rows-[64px_auto] overflow-auto bg-[#F4F4F4] px-[20px] text-black">
        <div class="flex h-[64px] items-center justify-between">
          <div class="flex items-center gap-[8px] text-[20px]">
            <h2>Portfolio name</h2>
            <EditIcon />
          </div>
          <div class="flex items-center gap-[8px]">
            <Button
              image="/images/svg/portfolio/report-data.svg"
              text="Generate report"
            />
            <Button
              image="/images/svg/portfolio/rebalance.svg"
              text="Rebalance"
            />
            <Button
              image="/images/svg/portfolio/dca.svg"
              text="DCA"
            />
            <Button
              image="/images/svg/portfolio/structures.svg"
              text="See all structures"
            />
            <Button
              image="/images/svg/portfolio/add.svg"
              text="Create new structure"
              newClass="bg-[#0C63E9] text-white"
            />
          </div>
        </div>
        <div class="grid grid-cols-[2fr_1fr] gap-[10px]  pb-[20px]">
          <div class="flex flex-col min-h-[260px] min-w-[580px] gap-[20px] overflow-auto rounded-[8px] bg-white p-[20px]">
            <p class="text-[16px] font-medium">Token list</p>
            <div class="flex gap-[8px]">
              <Button
                image="/images/svg/portfolio/search.svg"
                text="Search for name"
                newClass="min-w-[240px] justify-start pl-[6px] text-[#A8A8A8]"
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Subportfolio"
                newClass="flex-row-reverse"
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Wallet"
                newClass="flex-row-reverse "
              />
              <Button
                image="/images/svg/portfolio/arrowDown.svg"
                text="Network"
                newClass="flex-row-reverse"
              />
            </div>
            {/* Start groups */}
            <div class="overflow-auto grid grid-rows-[40px_auto] gap-[8px] items-center text-[14px] text-[#222222]" style="grid-template-columns: minmax(200px, auto) minmax(100px, auto) repeat(4, minmax(145px, auto)) 16px;">
              <div class="font-normal text-[#222222] text-opacity-[50%] text-[10px] pl-[20px]">TOKEN NAME</div>
              <div class="font-normal text-[#222222] text-opacity-[50%] text-[10px]">QUANTITY</div>
              <div class="font-normal text-[#222222] text-opacity-[50%] text-[10px]">VALUE</div>
              <div class="flex items-center gap-[8px] font-normal text-[#222222] text-opacity-[50%] text-[10px]">
                CHANGE
                <div class="flex items-center justify-center bg-[#F0F0F0] rounded-sm" style="height: 20px; width: 80px;">
                  <button class="h-[16px] w-[25px] bg-white rounded-sm">24h</button>
                  <button class="h-[16px] w-[25px] text-[#A7A7A7]">3d</button>
                  <button class="h-[16px] w-[25px] text-[#A7A7A7]">30d</button>
                </div>
              </div>
              <div class="font-normal text-[#222222] text-opacity-[50%] text-[10px]">WALLET</div>
              <div class="font-normal text-[#222222] text-opacity-[50%] text-[10px]">NETWORK</div>
              <div class="pr-[20px]"></div>
              <div class="bg-[#EFEFEF] col-span-full h-[1px]"></div>
              <Group name="Investment">
                <Token
                  icone="/images/svg/portfolio/btc.svg"
                  name="Wrapped Bitcoin"
                  symbol="WBTC"
                  qauntity="427"
                  value="$82 617,96"
                  wallet="TreasuryWBTC"
                  network="Ethereum"
                />
                <Token
                  icone="/images/svg/portfolio/btc.svg"
                  name="Wrapped Bitcoin"
                  symbol="WBTC"
                  qauntity="427"
                  value="$82 617,96"
                  wallet="TreasuryWBTC"
                  network="Ethereum"
                />
              </Group>
            </div>
            {/* <table class="overflow-auto">
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
                <Group text="Investment">
                  <Token/>
                </Group>
                <Group text="Operating Costs">
                  
                </Group>
              </tbody>
            </table> */}
          </div>
          <div class="flex flex-col gap-[25px] min-w-[440px] overflow-auto rounded-[8px] bg-white p-[20px]">
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
                <button class="h-[28px]">Month</button>
                <button class="h-[28px]">Year</button>
              </div>
              <div class="">
                <Graph class="min-w-[400px]"/>
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
                gravida malesuada. Name eleifend at dui non viverra. Nullam ut
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
