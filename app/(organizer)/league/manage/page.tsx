import type { Metadata } from "next";
import { AccessCodeGate } from "@/components/organizer/access-code-gate";
import { ManageLeague } from "@/components/organizer/manage-league";
import { Container } from "@/components/ui/container";
import { toGroupResultMap } from "@/lib/league/group-stage";
import { GROUP_RESULTS, SEASON, TEAMS } from "@/lib/league/sample-data";

export const metadata: Metadata = {
  title: `Manage Season ${SEASON.number}`,
  robots: { index: false, follow: false },
};

export default function ManageLeaguePage() {
  return (
    <Container className="pt-12 pb-6">
      <AccessCodeGate>
        <ManageLeague
          seasonNumber={SEASON.number}
          teams={TEAMS}
          playoffFormat={SEASON.playoffFormat}
          initialResults={toGroupResultMap(GROUP_RESULTS)}
          initialPlayoffEntries={{}}
        />
      </AccessCodeGate>
    </Container>
  );
}
