import { BrandLogo } from "@/components/ui/brand-logo";
import { ExternalButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { COMMUNITY, DISCORD_INVITE_URL, FACEBOOK_PAGE_URL, SEASON } from "@/lib/league/sample-data";

const JOIN_STEPS = [
  "Message our Facebook page",
  `Sign up for tournaments like ${SEASON.leagueName}`,
  "Get drafted into a team and play",
] as const;

/**
 * Home page hero: welcomes solo players looking for a community or a tournament. Joining happens through
 * the Facebook page, so that's the main action; the Discord is where members hang out. */
export function HomeHero() {
  return (
    <section aria-labelledby="home-hero-title" className="relative overflow-hidden" data-testid="home-hero">
      {/* Oversized faded wordmark behind the content. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-display text-[clamp(170px,34vw,500px)] leading-[0.78] font-bold whitespace-nowrap text-auh-ink/[.07] select-none"
        data-testid="hero-wordmark"
      >
        <span>AUH</span>
        <span>GAMING</span>
      </div>

      <Container className="relative flex flex-col items-center gap-8 pt-10 pb-16 text-center md:pt-16 md:pb-20">
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
            Playing solo? You’re in the right place. Message our Facebook page to join and sign up for the next
            tournament.
          </p>
        </div>

        <JoinPanel />
      </Container>
    </section>
  );
}

/** Navy card: how to join through the Facebook page, with the Discord as the second option. */
function JoinPanel() {
  return (
    <div className="notch-b flex w-full max-w-[560px] flex-col gap-5 bg-auh-ink p-5 text-left text-auh-cream sm:p-7" data-testid="join-panel">
      <h2 className="flex items-center gap-3 font-display text-[36px] leading-none text-auh-yellow sm:text-[42px]">
        <FacebookIcon className="size-8 shrink-0" />
        Join the community
      </h2>

      <ol className="flex flex-col gap-2.5 text-[15px]">
        {JOIN_STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex size-7 shrink-0 items-center justify-center bg-auh-orange pt-[3px] font-display text-lg leading-none text-auh-ink"
            >
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <ExternalButtonLink href={FACEBOOK_PAGE_URL} variant="primary" className="w-full gap-2.5" data-testid="hero-facebook-link">
        <FacebookIcon className="size-5 shrink-0" />
        Message us on Facebook
      </ExternalButtonLink>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-auh-ink-soft pt-4">
        <p className="flex items-center gap-2.5 text-[15px]" data-testid="players-online">
          <span aria-hidden="true" className="relative inline-flex size-3">
            <span className="absolute inset-0 animate-ping bg-auh-green opacity-60" />
            <span className="relative inline-block size-3 bg-auh-green" />
          </span>
          <span className="font-display text-[28px] leading-none tabular-nums" data-testid="players-online-count">
            {COMMUNITY.playersOnline}
          </span>
          <span className="text-auh-cream-dim">online on Discord</span>
        </p>
        <ExternalButtonLink href={DISCORD_INVITE_URL} variant="ghost-light" className="gap-2" data-testid="hero-discord-link">
          <DiscordIcon className="size-5 shrink-0" />
          Hang out on Discord
        </ExternalButtonLink>
      </div>
    </div>
  );
}
