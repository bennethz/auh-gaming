import type { Metadata } from "next";
import { AccessCodeGate } from "@/components/organizer/access-code-gate";
import { ManageLeague } from "@/components/organizer/manage-league";
import { Container } from "@/components/ui/container";
import { getLeagueData } from "@/lib/league/data";
import { SEASON } from "@/lib/league/sample-data";

export const metadata: Metadata = {
  title: `Manage Season ${SEASON.number}`,
  robots: { index: false, follow: false },
};

export default async function ManageLeaguePage() {
  const { teams, rosters, groupResults, deductions, tiebreakOrder, playoffEntries, playoffSeeds } =
    await getLeagueData();

  return (
    <Container className="pt-12 pb-6">
      <AccessCodeGate>
        <ManageLeague
          seasonNumber={SEASON.number}
          initialTeams={teams}
          initialRosters={rosters}
          playoffFormat={SEASON.playoffFormat}
          initialResults={groupResults}
          initialPlayoffEntries={playoffEntries}
          initialDeductions={deductions}
          initialTiebreakOrder={tiebreakOrder}
          initialPlayoffSeeds={playoffSeeds}
        />
      </AccessCodeGate>
    </Container>
  );
}
