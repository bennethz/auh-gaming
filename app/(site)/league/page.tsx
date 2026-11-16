import type { Metadata } from "next";
import { GroupResults } from "@/components/league/group-results";
import { LeaderboardTable } from "@/components/league/leaderboard-table";
import { LeagueHero } from "@/components/league/league-hero";
import { LeagueViewTabs } from "@/components/league/league-view-tabs";
import { PlayoffBrackets } from "@/components/league/playoff-brackets";
import { Container } from "@/components/ui/container";
import { buildPlayoffBrackets } from "@/lib/league/bracket";
import { getLeagueData } from "@/lib/league/data";
import { buildGroupRecords } from "@/lib/league/group-stage";
import { getChampion, getSeasonStatus, getSeededTeams, resolvePlayoffs } from "@/lib/league/playoffs";
import { SEASON } from "@/lib/league/sample-data";
import { buildStandings, FORMAT_RULES } from "@/lib/league/standings";
import { getPlayoffRosters } from "@/lib/league/teams";

export const metadata: Metadata = {
  title: `${SEASON.leagueName} Season ${SEASON.number}`,
  description: `Group stage standings and playoff bracket for ${SEASON.leagueName} Season ${SEASON.number}.`,
};

export default async function LeaguePage() {
  const { teams, rosters, groupResults, deductions, tiebreakOrder, playoffEntries, playoffSeeds } =
    await getLeagueData();
  const format = SEASON.playoffFormat;
  const standings = buildStandings(buildGroupRecords(teams, groupResults), teams, format, deductions, tiebreakOrder);
  // Teams appear only once the organizers generate the playoffs and freeze the seeds.
  const isGenerated = playoffSeeds.length > 0;
  const brackets = resolvePlayoffs(
    buildPlayoffBrackets(format),
    isGenerated ? getSeededTeams(playoffSeeds, teams) : [],
    isGenerated ? playoffEntries : {},
  );
  const playoffRosters = getPlayoffRosters(isGenerated ? getSeededTeams(playoffSeeds, teams) : [], rosters);

  return (
    <>
      <LeagueHero status={getSeasonStatus(isGenerated, getChampion(brackets) !== undefined)} />
      <Container>
        <LeagueViewTabs
          playoffsLive={isGenerated}
          leaderboard={
            <>
              <LeaderboardTable rows={standings} format={format} />
              <GroupResults teams={teams} results={groupResults} />
            </>
          }
          playoffs={
            <PlayoffBrackets
              brackets={brackets}
              rosters={playoffRosters}
              formatSummary={FORMAT_RULES[format].summary}
              isGenerated={isGenerated}
            />
          }
        />
      </Container>
    </>
  );
}
