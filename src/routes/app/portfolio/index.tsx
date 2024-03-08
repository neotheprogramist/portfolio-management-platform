import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/portfolio/button-master/button";
import  EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";
import Graph from "/public/images/chart.png?jsx";
import Bitcoin from "/public/images/svg/portfolio/btc.svg?jsx";

export default component$(() => {
    return (
      <>
        <div class="flex justify-between items-center h-[64px]">
            <div class="flex gap-2 text-xl items-center min-w-[158px]">
                <span>Portfolio name</span>
                <EditIcon/>
            </div>
            <div class="flex gap-2 items-center justify-end">
                <Button image="/images/svg/portfolio/report-data.svg" text="Generate report" newClass="min-w-[143px]"/>
                <Button image="/images/svg/portfolio/rebalance.svg" text="Rebalance" newClass="min-w-[108px]"/>
                <Button image="/images/svg/portfolio/dca.svg" text="DCA" newClass="min-w-[68px]"/>
                <Button image="/images/svg/portfolio/structures.svg" text="See all structures" newClass="min-w-[153px]"/>
                <Button image="/images/svg/portfolio/add.svg" text="Create new structure" newClass="bg-[#0C63E9] text-white min-w-[175px]"/>
            </div>
        </div>
        <div class="grid grid-cols-[2fr_1fr] gap-[10px] pb-[20px]">
            <div class="p-5 bg-white rounded-lg flex flex-col gap-[20px] min-w-[300px] min-h-[200px] overflow-auto">
                <div>
                    <p class="text-base">Token list</p>
                </div>
                <div class="flex gap-2">
                    <Button image="/images/svg/portfolio/search.svg" text="Search for name" newClass="min-w-[240px] justify-start pl-[6px] text-[#A8A8A8]"/>
                    <Button image="/images/svg/portfolio/arrowDown.svg" text="Subportfolio" newClass="min-w-[118px] flex-row-reverse"/>
                    <Button image="/images/svg/portfolio/arrowDown.svg" text="Wallet" newClass="min-w-[80px] flex-row-reverse "/>
                    <Button image="/images/svg/portfolio/arrowDown.svg" text="Network" newClass="min-w-[94px] flex-row-reverse"/>
                </div>
                <div>
                    <div class="text-[10px] h-[40px] px-[20px] border-b-[1px] border-opacity-50 border-gray-500 flex items-center gap-[8px]">
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
                    <div></div>
                </div>
            </div>
            <div class="p-[20px] bg-white rounded-lg flex flex-col gap-[25px] min-w-[440px]">
                <div class="h-[32px] flex items-center justify-between gap-[5px] ">
                    <p class="text-base">Details</p>
                    <div class="flex gap-[5px]">
                        <Button image="/images/svg/portfolio/rebalance.svg" text="Rebalance" newClass="min-w-[116px]"/>
                        <Button image="/images/svg/portfolio/rebalance.svg" text="Rebalance" newClass="min-w-[116px]"/>
                    </div>
                </div>
                <div class="flex items-center gap-[16px] h-[64px]" >
                    <div class="rounded-full w-[64px] h-[64px] border border-[#E6E6E6] flex items-center justify-center">
                        <Bitcoin  width={40} height={40} class="min-w-[40px]"/>
                    </div>
                    <div class="flex flex-col gap-[4px]">
                        <h4 class="text-[18px]">Wrapped Bitcoin</h4>
                        <p class="text-xs text-[#222222] text-opacity-50">WBTC</p>
                    </div>
                </div>
                <div class="flex flex-col gap-[20px]">
                    <p class="text-[18px] mt-[11px]">$82 617,96</p>
                    <div class="flex gap-[12px] text-sm">
                        <p>TRANSFER</p>
                        <p>RECEIVE</p>
                    </div>
                    <div class="grid grid-cols-4 items-center w-[398px] h-[32px] rounded-[4px] bg-[#F0F0F0] text-[#A7A7A7] text-[10px]">
                        <button class="h-[28px]">Hour</button>
                        <button class="h-[28px]  bg-white rounded-sm text-black">Day</button>
                        <button class="h-[28px] ">Month</button>
                        <button class="h-[28px]">Year</button>
                    </div>
                    <div class="">
                        <Graph class="min-w-[400px]"/>
                    </div>
                </div>
                <div class="flex flex-col min-w-[370px] gap-[20px] mt-[28px] overflow-auto">
                    <h4 class="font-medium text-base">Market data</h4>
                    <p class="font-regular text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna diam, dapibus sed justo ac, pretium aliquet augue. Sed sit amet vulputate felis, vel bibendum ligula. Cras sed erat libero. Curabitur pretium, sem vitae scelerisque euismod, metus arcu pretium tellus, ac interdum enim felis vitae diam. Vivamus quis lacinia justo, in porttitor massa. Suspendisse blandit ex sed gravida malesuada. Nam eleifend at dui non viverra. Nullam ut congue odio. Curabitur ac turpis ipsum. Nulla vel eros scelerisque, vehicula diam vitae, cursus eros. Donec et turpis eget sapien faucibus placerat quis vel mauris. Mauris ultricies eget sem eu semper. Aenean non viverra dui. Curabitur placerat risus at leo ornare mollis
                    </p>
                </div>
            </div>
        </div>
      </>
    )
  });