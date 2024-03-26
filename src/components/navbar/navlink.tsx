import { Slot, component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export interface NavLinkProps {
  activeClass?: string;
  href: string;
  class_?: string;
}
export const NavLink = component$<NavLinkProps>(({ href }) => {
  const location = useLocation();
  const toPathname = href;
  const locationPathname = location.url.pathname;

  const isActive = locationPathname.startsWith(toPathname);
  return (
    <a
      href={href}
      class={
        isActive
          ? "m-2.5 text-white no-underline"
          : "m-2.5 text-white no-underline opacity-50"
      }
    >
      <Slot />
    </a>
  );
});
