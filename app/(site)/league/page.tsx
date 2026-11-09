import type { Metadata } from "next";
import { GroupResults } from "@/components/league/group-results";
import { LeaderboardTable } from "@/components/league/leaderboard-table";
import { LeagueHero } from "@/components/league/league-hero";
import { LeagueViewTabs } from "@/components/league/league-view-tabs";
import { PlayoffBrackets } from "@/components/league/playoff-brackets";
import { Container } from "@/components/ui/container";
import { buildPlayoffBrackets } from "@/lib/league/bracket";
import { toGroupResultMap } from "@/lib/league/group-stage";
import { GROUP_RECORDS, GROUP_RESULTS, SEASON, TEAMS } from "@/lib/league/sample-data";
import { buildStandings, FORMAT_RULES } from "@/lib/league/standings";

export const metadata: Metadata = {
  title: `${SEASON.leagueName} Season ${SEASON.number}`,
  description: `Group stage standings and playoff bracket for ${SEASON.leagueName} Season ${SEASON.number}.`,
};

export default function LeaguePage() {
  const format = SEASON.playoffFormat;
  const standings = buildStandings(GROUP_RECORDS, TEAMS, format);
  const brackets = buildPlayoffBrackets(format);

  return (
    <>
      <LeagueHero />
      <Container>
        <LeagueViewTabs
          leaderboard={
            <>
              <LeaderboardTable rows={standings} format={format} />
              <GroupResults teams={TEAMS} results={toGroupResultMap(GROUP_RESULTS)} />
            </>
          }
          playoffs={<PlayoffBrackets brackets={brackets} formatSummary={FORMAT_RULES[format].summary} />}
        />
      </Container>
    </>
  );
}
