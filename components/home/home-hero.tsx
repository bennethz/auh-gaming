import { BrandLogo } from "@/components/ui/brand-logo";
import { ExternalButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { COMMUNITY, DISCORD_INVITE_URL, SEASON } from "@/lib/league/sample-data";

const DISCORD_PERKS = [
  "Meet players from across the MENA region",
  `Sign up for community tournaments like ${SEASON.leagueName}`,
  "Get tournament news, schedules and results first",
] as const;

/**
 * Home page hero: welcomes solo players looking for a community or a tournament,
 * with the Discord invite as the main action. Logo, copy and Discord card stacked and centered.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative overflow-hidden border-b-6 border-auh-ink"
      data-testid="home-hero"
    >
      {/* Oversized faded wordmark behind the content. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-display text-[clamp(170px,34vw,500px)] leading-[0.78] font-bold whitespace-nowrap text-auh-ink/[.07] select-none"
        data-testid="hero-wordmark"
      >
        <span>AUH</span>
        <span>GAMING</span>
      </div>

      <Container className="relative flex flex-col items-center gap-8 pt-10 pb-12 text-center md:pt-16 md:pb-14">
        <BrandLogo size="hero" className="shrink-0" />

        <div className="flex max-w-[640px] flex-col items-center gap-4">
          <p className="text-sm font-semibold text-auh-olive" data-testid="hero-tagline">
            {COMMUNITY.tagline}
          </p>
          <h1
            id="home-hero-title"
            className="font-display text-[clamp(36px,4vw,56px)] leading-[0.92] font-semibold"
          >
            Find your community. Compete in our tournaments.
          </h1>
          <p className="max-w-[46ch] text-lg leading-[1.55] text-auh-olive">
            Playing solo? You’re in the right place. Join our Discord to meet other players and sign up for the next
            tournament.
          </p>
        </div>

        <DiscordPanel />
      </Container>
    </section>
  );
}

/** Navy card with the Discord invite, the players-online count and what members get. */
function DiscordPanel() {
  return (
    <div className="notch-b flex w-full max-w-[560px] flex-col gap-5 bg-auh-ink p-5 text-left text-auh-cream sm:p-7" data-testid="discord-panel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 font-display text-[36px] leading-none text-auh-yellow sm:text-[42px]">
          <DiscordIcon className="size-9 shrink-0" />
          Join our Discord
        </h2>
        <p className="flex items-center gap-2.5" data-testid="players-online">
          <span aria-hidden="true" className="relative inline-flex size-3">
            <span className="absolute inset-0 animate-ping bg-auh-green opacity-60" />
            <span className="relative inline-block size-3 bg-auh-green" />
          </span>
          <span className="font-display text-[34px] leading-none tabular-nums" data-testid="players-online-count">
            {COMMUNITY.playersOnline}
          </span>
          <span className="text-[15px] text-auh-cream-dim">players online</span>
        </p>
      </div>

      <ul className="flex flex-col gap-2 text-[15px]">
        {DISCORD_PERKS.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5">
            <span aria-hidden="true" className="mt-[7px] inline-block size-2 shrink-0 bg-auh-orange" />
            {perk}
          </li>
        ))}
      </ul>

      <ExternalButtonLink href={DISCORD_INVITE_URL} variant="primary" className="w-full" data-testid="hero-discord-link">
        Join the Discord
      </ExternalButtonLink>
    </div>
  );
}
