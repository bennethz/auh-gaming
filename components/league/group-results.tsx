import { GroupStageMatrix } from "@/components/organizer/group-stage-matrix";
import { SectionHeading } from "@/components/ui/section-heading";
import type { GroupResultMap } from "@/lib/league/group-stage";
import type { Team } from "@/lib/league/types";

interface GroupResultsProps {
  teams: Team[];
  results: GroupResultMap;
}

/** Public, read-only round robin grid of every group stage series result. */
export function GroupResults({ teams, results }: GroupResultsProps) {
  return (
    <section aria-labelledby="group-results-title" className="pt-10 pb-6" data-testid="group-results">
      <SectionHeading
        id="group-results-title"
        title="Group stage results"
        description="Scores are from the row team’s side. Hover a column number for the team."
      />
      <GroupStageMatrix teams={teams} results={results} />
    </section>
  );
}
