import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Badge, Tag } from "@/components/ui/tag";
import { SEASON } from "@/lib/league/sample-data";
import { FORMAT_RULES } from "@/lib/league/standings";

/** League page header with season status and the organizer entry point. */
export function LeagueHero() {
  return (
    <section aria-labelledby="league-title" className="border-b-6 border-auh-ink" data-testid="league-hero">
      <Container className="flex flex-wrap items-end justify-between gap-6 pt-12 pb-9">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <Tag>Season {SEASON.number}</Tag>
            <Badge data-testid="league-status-badge">Group stage live</Badge>
          </div>
          <h1
            id="league-title"
            className="max-w-[12ch] font-display text-[clamp(48px,7vw,92px)] leading-[0.88] font-semibold"
          >
            {SEASON.leagueName}
          </h1>
          <p className="max-w-[52ch] text-lg leading-[1.55] text-auh-olive">
            {SEASON.teamCount} teams, one group. {FORMAT_RULES[SEASON.playoffFormat].summary}
          </p>
        </div>
        {/* TODO: Show only to signed-in organizers once authentication exists. */}
        <ButtonLink href="/league/manage" variant="dark" data-testid="manage-league-link">
          Manage league
        </ButtonLink>
      </Container>
    </section>
  );
}
