import { Slot, component$ } from '@builder.io/qwik';
import { Link, useLocation, type LinkProps } from '@builder.io/qwik-city';
 
type NavLinkProps = LinkProps & { activeClass?: string };
 
export const NavLink = component$(
  ({ activeClass, ...props }: NavLinkProps) => {
    const location = useLocation();
    const toPathname = props.href ?? '';
    const locationPathname = location.url.pathname;

    const isActive = locationPathname === toPathname || locationPathname.startsWith(toPathname);

    console.log(isActive);

    return (
      <Link
        {...props}
        class={`${props.class || ''} ${isActive ? activeClass : ''}`}
      >
        <Slot />
      </Link>
    );
  }
);