import ImgAvatar from "/public/images/avatar.png?jsx";
import ArrowDown from "/public/images/arrowDown.svg?jsx";
import { component$, Slot } from "@builder.io/qwik";
import Logo from "/public/images/logo.png?jsx";

export const Navbar = component$(() => {
  return (
    <>
      <div class="flex w-full flex-row items-center justify-between border-b border-white border-opacity-20 bg-black p-6 text-xs text-gray-400">
        {/* <div class="absolute left-80 block h-1/4 w-6/12 rounded-full gradient"></div> */}
        <Logo />
        <div class="flex items-center gap-10">
          <a href="/app/dashboard" class="m-2.5 text-white no-underline">
            Dashboard
          </a>
          <a href="/app/portfolio" class="text-grey m-2.5 no-underline">
            Portfolio
          </a>
          <a href="/app/wallets" class="text-grey m-2.5 no-underline">
            Wallets
          </a>
          <a href="/app/action" class="text-grey m-2.5 no-underline">
            Action
          </a>
          <a href="/app/automation" class="text-grey m-2.5 no-underline">
            Automation
          </a>
          <a href="/app/alerts" class="text-grey m-2.5 no-underline">
            Alerts
          </a>
          <a href="/app/reports" class="text-grey m-2.5 no-underline">
            Reports
          </a>
        </div>
        <div class="flex items-center gap-1">
          <Slot />
          <ImgAvatar />
          <div class="">
            <p>0x5B...83bd</p>
            <p class="text-green-500">Account verified</p>
          </div>
          <button>
            <ArrowDown />
          </button>
        </div>
      </div>
    </>
  );
});
