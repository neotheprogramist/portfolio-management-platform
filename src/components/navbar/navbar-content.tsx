import { component$, Slot } from "@builder.io/qwik";
import { NavLink } from "./LinkProps";
import ImgAvatar from "/public/images/avatar.png?jsx";
import ArrowDown from "/public/images/arrowDown.svg?jsx";

export const NavbarContent = component$(() => {
  return (
    <>
      <div class="flex items-center gap-10">
        <NavLink
          href="/app/dashboard"
          class="m-2.5 no-underline"
          activeClass="text-white"
        >
          Dashboard
        </NavLink>
        <NavLink
          href="/app/portfolio"
          class="text-grey m-2.5 no-underline"
          activeClass="text-white"
        >
          Portfolio
        </NavLink>
        <NavLink
          href="/app/wallets"
          class="text-grey m-2.5 no-underline"
          activeClass="text-white"
        >
          Wallets
        </NavLink>
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
      <div class="grid justify-items-end">
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
