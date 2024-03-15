import { component$, Slot } from "@builder.io/qwik";
import { Link, useLocation, type LinkProps } from '@builder.io/qwik-city';
import ImgAvatar from "/public/images/avatar.png?jsx";
import ArrowDown from "/public/images/arrowDown.svg?jsx";

type NavbarContentProps = LinkProps & { activeClass?: string };

export const NavbarContent = component$(
  ({ activeClass, ...props }: NavbarContentProps) => {
    const location = useLocation();
    const toPathname = props.href ?? '';
    const locationPathname = location.url.pathname;
 
    const startSlashPosition =
      toPathname !== '/' && toPathname.startsWith('/')
        ? toPathname.length - 1
        : toPathname.length;
    const endSlashPosition =
      toPathname !== '/' && toPathname.endsWith('/')
        ? toPathname.length - 1
        : toPathname.length;
    const isActive =
      locationPathname === toPathname ||
      (locationPathname.endsWith(toPathname) &&
        (locationPathname.charAt(endSlashPosition) === '/' ||
          locationPathname.charAt(startSlashPosition) === '/'));
  return (
    <>
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
