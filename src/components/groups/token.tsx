import { component$ } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import Bitcoin from "/public/images/svg/portfolio/btc.svg?jsx";
import MenuDots from "/public/images/svg/portfolio/menuDots.svg?jsx"

export interface TokenProps {
    icone?: string;
    name?: string;  
    symbol?: string;
    qauntity?: string;
    value?: string;
    wallet?: string;
    network?: string;
}

export const Token = component$<TokenProps>((props) => {
    return (
        <>
        <div class="pl-[20px] flex h-[40px] items-center gap-[6px] ">
            <div class="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#E6E6E6]">
                {props.icone && <img src={props.icone} width="20" height="20" />}
            </div>
            <div class="flex items-end gap-[6px]">
                <p>{props.name}</p>
                <span class="text-[10px] text-[#222222] text-opacity-[50%]">
                    {props.symbol}
                </span>
            </div>
        </div>
        <div class="">
            <span class="">{props.qauntity}</span>
        </div>
        <div class="">
            <span class="font-medium">{props.value}</span>
        </div>
        <div class="">
            <span class=""></span>
        </div>
        <div class="">
            <span class="">{props.wallet}</span>
        </div>
        <div class="">
            <span class="underline underline-offset-2">{props.network}</span>
        </div>
        <button class="rounded-[2px] bg-[#22222214] bg-opacity-[8]">
            <MenuDots/>
        </button>
        </>
    );
})