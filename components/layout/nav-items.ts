export interface NavItem {
  label: string;
  href: string;
}

/** Main navigation, shared by the desktop nav and the mobile menu. */
export const MAIN_NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Civil War", href: "/league" },
  { label: "Contact Us", href: "/contact" },
];
