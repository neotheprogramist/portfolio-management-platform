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
      <div class="custom-text-50 flex items-center gap-[40px]">
        <a href="/app/dashboard" class="">
          Dashboard
        </a>
        <a href="/app/portfolio" class="">
          Portfolio
        </a>
        <a href="/app/wallets" class="">
          Wallets
        </a>
        <a href="/app/action" class="">
          Action
        </a>
        <a href="/app/automation" class="">
          Automation
        </a>
        <a href="/app/alerts" class="">
          Alerts
        </a>
        <a href="/app/reports" class="">
          Reports
        </a>
      </div>
      <div class="flex items-center gap-[8px]">
        <ImgAvatar />
        <div class="flex flex-col gap-[4px]">
          <p>{address}</p>

          <p class="text-[#12A58C] text-[10px]">Account verified</p>
        </div>
        <button>
          <ArrowDown />
        </button>
      </div>
    </>
  );
});
