import { Slot, component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export interface NavLinkProps {
  href: string;
}
export const NavLink = component$<NavLinkProps>(({ href }) => {
  const location = useLocation();
  const toPathname = href;
  const locationPathname = location.url.pathname;

  const isActive = locationPathname.startsWith(toPathname);
  return (
    <a
      href={href}
      class={`m-2.5 text-white no-underline${isActive ? "" : " opacity-50"}`}
    >
      <Slot />
    </a>
  );
});