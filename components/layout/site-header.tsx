import { DiscordIcon } from "@/components/ui/discord-icon";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { DISCORD_INVITE_URL, FACEBOOK_PAGE_URL } from "@/lib/league/sample-data";
import { HomeLink } from "./home-link";
import { MainNav } from "./main-nav";

/** Sticky navy header for public pages: brand on the left, nav plus Facebook and Discord links on the right. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-auh-ink text-auh-yellow" data-testid="site-header">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-3 gap-y-2.5 px-5 py-2.5">
        <HomeLink />
        <MainNav />
        <a
          href={FACEBOOK_PAGE_URL}
          rel="noopener noreferrer"
          aria-label="Message us on Facebook"
          title="Message us on Facebook"
          className="group flex size-11 items-center justify-center text-auh-cream transition-colors duration-200 hover:text-auh-yellow focus-visible:outline-3 focus-visible:outline-auh-orange"
          data-testid="header-facebook-link"
        >
          <FacebookIcon className="size-6 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110" />
        </a>
        <a
          href={DISCORD_INVITE_URL}
          rel="noopener noreferrer"
          aria-label="Join us on Discord"
          title="Join us on Discord"
          className="group hidden size-11 items-center justify-center text-auh-cream transition-colors duration-200 hover:text-auh-yellow focus-visible:outline-3 focus-visible:outline-auh-orange sm:flex"
          data-testid="header-discord-link"
        >
          <DiscordIcon className="size-7 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110" />
        </a>
      </div>
    </header>
  );
}
