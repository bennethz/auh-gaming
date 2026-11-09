"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { MAIN_NAV_ITEMS } from "./nav-items";

/** Shared link styles. The `after:` pseudo-element is the yellow highlight bar. */
const LINK_CLASS_NAME =
  "relative px-3 py-2 font-display text-[22px] text-auh-cream transition-colors duration-200 after:absolute after:bg-auh-yellow after:transition-transform after:duration-200 after:ease-out hover:text-auh-yellow hover:after:scale-100 focus-visible:outline-3 focus-visible:outline-auh-orange aria-[current=page]:text-auh-yellow aria-[current=page]:after:scale-100";

/** Desktop: bar under the label that grows from the centre. */
const DESKTOP_LINK_CLASS_NAME =
  "after:inset-x-3 after:bottom-1 after:h-[3px] after:scale-x-0 aria-[current=page]:after:h-1";

/** Mobile: bar on the left edge that grows vertically, with a tinted row for the current page. */
const MOBILE_LINK_CLASS_NAME =
  "pl-5 after:inset-y-2 after:left-0 after:w-1 after:scale-y-0 hover:bg-auh-ink-soft/60 aria-[current=page]:bg-auh-ink-soft";

/**
 * Main site navigation.
 * Shows inline links from 768px up and a menu button with a full-width panel below that.
 */
export function MainNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();

  const getCurrent = (href: string) => (href === pathname ? "page" : undefined);

  return (
    <>
      <nav aria-label="Main" className="ml-auto hidden flex-wrap justify-end gap-0.5 md:flex" data-testid="main-nav">
        {MAIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={getCurrent(item.href)}
            className={cn(LINK_CLASS_NAME, DESKTOP_LINK_CLASS_NAME)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        className="ml-auto min-h-11 border-2 border-auh-cream-dim px-3.5 font-display text-[22px] leading-none text-auh-cream focus-visible:outline-3 focus-visible:outline-auh-orange md:hidden"
        data-testid="mobile-menu-button"
      >
        {isMenuOpen ? "Close" : "Menu"}
      </button>

      <nav
        id={menuId}
        aria-label="Main"
        hidden={!isMenuOpen}
        className="order-last w-full border-t border-auh-ink-soft pt-2 md:hidden"
        data-testid="mobile-menu"
      >
        <ul className="flex flex-col">
          {MAIN_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={getCurrent(item.href)}
                onClick={() => setIsMenuOpen(false)}
                className={cn(LINK_CLASS_NAME, MOBILE_LINK_CLASS_NAME, "flex min-h-11 items-center")}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
