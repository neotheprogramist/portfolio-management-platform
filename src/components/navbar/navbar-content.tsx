import { component$, Slot, useContext } from "@builder.io/qwik";
import ImgAvatar from "/public/images/avatar.png?jsx";
import ArrowDown from "/public/images/arrowDown.svg?jsx";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { getAccount } from "@wagmi/core";

export const NavbarContent = component$(() => {
  const modalStore = useContext(ModalStoreContext);
  let address;
  modalStore.config &&
    (({ address } = getAccount(modalStore.config)),
    address && (address = address.slice(0, 4) + "..." + address.slice(-4)));
  return (
    <>
      <div class="flex items-center gap-10">
        <NavLink href="/app/dashboard" class="hover:text-white" activeClass="text-white">
          Dashboard
        </NavLink>
        <NavLink href="/app/portfolio" class="hover:text-white" activeClass="text-white">
          Portfolio
        </NavLink>
        <NavLink href="/app/wallets" class="hover:text-white" activeClass="text-white">
          Wallets
        </NavLink>
        <NavLink href="/app/action" class="hover:text-white" activeClass="text-white">
          Action
        </NavLink>
        <NavLink href="/app/automation" class="hover:text-white" activeClass="text-white">
          Automation
        </NavLink>
        <NavLink href="/app/alerts" class="hover:text-white" activeClass="text-white">
          Alerts
        </NavLink>
        <NavLink href="/app/reports" class="hover:text-white" activeClass="text-white">
          Reports
        </NavLink>
      </div>
      <div class="grid justify-items-end">
        <div class="flex items-center gap-1">
          <Slot />
          <ImgAvatar />
          <div class="">
            <p>{address}</p>

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
