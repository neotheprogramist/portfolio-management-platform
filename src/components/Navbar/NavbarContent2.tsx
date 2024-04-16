import { component$, useContext } from "@builder.io/qwik";
import ImgAvatar from "/public/assets/images/avatar.png?jsx";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { getAccount } from "@wagmi/core";
import { NavLink } from "./NavLink2";

export const NavbarContent = component$(() => {
  const modalStore = useContext(ModalStoreContext);
  let address;
  modalStore.config &&
    (({ address } = getAccount(modalStore.config)),
    address && (address = address.slice(0, 4) + "..." + address.slice(-4)));
  return (
    <>
      <div class="flex items-center gap-10 ">
        <NavLink href="/app/dashboard/">Dashboard</NavLink>
        <NavLink href="/app/portfolio/">Portfolio</NavLink>
        <NavLink href="/app/wallets/">Wallets</NavLink>
        <NavLink href="/app/action/">Action</NavLink>
        <NavLink href="/app/automation/">Automation</NavLink>
        <NavLink href="/app/alerts/">Alerts</NavLink>
        <NavLink href="/app/reports/">Reports</NavLink>
      </div>
      <div class="flex items-center gap-2">
        <ImgAvatar />
        <div class="flex flex-col">
          <p>{address}</p>

          <p class="text-[10px] text-customGreen">Account verified</p>
        </div>
        <button>
          <IconArrowDown />
        </button>
      </div>
    </>
  );
});
