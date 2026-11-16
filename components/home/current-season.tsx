import { ChampionCard, Eyebrow, LaterMatches, Podium, VersusCard } from "@/components/home/match-center";
import { MatchRosterProvider } from "@/components/league/match-roster";
import { PlayoffLegend, StandingsTable } from "@/components/league/standings-table";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge, Tag } from "@/components/ui/tag";
import { formatLongDate } from "@/lib/format-date";
import { getSeasonStatus } from "@/lib/league/playoffs";
import { FACEBOOK_PAGE_URL, SEASON } from "@/lib/league/sample-data";
import { getSeasonSnapshot, type SeasonSnapshot } from "@/lib/league/season-snapshot";

const SEASON_LABEL = `${SEASON.leagueName} Season ${SEASON.number}`;

/**
 * Current Civil War season, in two parts:
 * - a navy match center band: the next playoff match as a versus card plus the other upcoming matches,
 *   or the top three teams on a podium during the group stage, or the champion once the grand final is played;
 * - the full group stage table on the yellow page (live, or final once the playoffs start),
 *   with links to the league page and the Facebook page.
 */
export async function CurrentSeason() {
  const snapshot = await getSeasonSnapshot();
  const { standings, asOf, isPlayoffsLive, champion } = snapshot;

  return (
    <section aria-labelledby="current-season-title" data-testid="current-season">
      <div className="bg-auh-ink text-auh-cream" data-testid="match-center">
        <Container className="reveal py-16 md:py-20">
          <SectionHeading
            id="current-season-title"
            title={SEASON_LABEL}
            titleClassName="text-auh-yellow"
            description={`${SEASON.teamCount} teams battling it out in our community ${SEASON.game} league.`}
            descriptionClassName="text-auh-cream-dim"
            className="mb-10"
            aside={
              <Badge data-testid="season-status-badge">
                {getSeasonStatus(isPlayoffsLive, champion !== undefined)}
              </Badge>
            }
          />
          <MatchCenterContent snapshot={snapshot} />
        </Container>
      </div>

      <Container className="reveal pt-12 pb-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          {isPlayoffsLive ? (
            <p className="flex items-center gap-2 text-[15px] font-semibold" data-testid="group-stage-completed">
              Final group stage standings
              <Tag tone="muted" data-testid="group-stage-completed-tag">
                Completed
              </Tag>
            </p>
          ) : (
            <p className="text-[15px] font-semibold" data-testid="standings-as-of">
              Group stage standings
              {asOf ? (
                <>
                  {" "}
                  as of <time dateTime={asOf}>{formatLongDate(asOf)}</time>
                </>
              ) : null}
            </p>
          )}
          <PlayoffLegend format={SEASON.playoffFormat} />
        </div>

        <StandingsTable rows={standings} showSeriesOnMobile rowTestId="home-standings-row" />

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <ButtonLink href="/league" variant="dark" data-testid="season-league-link">
            Results and playoff bracket →
          </ButtonLink>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
            <span>Want to play next season? Message us to sign up and get drafted into a team.</span>
            <ExternalButtonLink href={FACEBOOK_PAGE_URL} variant="ghost" data-testid="season-facebook-link">
              Message us on Facebook →
            </ExternalButtonLink>
          </p>
        </div>
      </Container>
    </section>
  );
}

/** What the match center band shows at each point in the season. */
function MatchCenterContent({ snapshot }: { snapshot: SeasonSnapshot }) {
  const { standings, asOf, isPlayoffsLive, nextMatch, laterMatches, champion, rosters } = snapshot;

  if (champion) {
    return <ChampionCard team={champion} seasonLabel={SEASON_LABEL} />;
  }

  if (isPlayoffsLive && nextMatch) {
    return (
      <MatchRosterProvider rosters={rosters}>
        <Eyebrow>Next up</Eyebrow>
        <VersusCard featured={nextMatch} />
        <LaterMatches matches={laterMatches} />
      </MatchRosterProvider>
    );
  }

  return (
    <>
      <Eyebrow>
        {isPlayoffsLive
          ? "Group stage top three"
          : asOf
            ? `Top of the table as of ${formatLongDate(asOf)}`
            : "Top of the table"}
      </Eyebrow>
      <Podium rows={standings} />
    </>
  );
}
