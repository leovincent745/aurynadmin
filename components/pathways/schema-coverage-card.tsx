import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RootPathway } from "@/lib/domain/root-pathway";

interface SchemaCoverageCardProps {
  pathway: RootPathway;
}

export function SchemaCoverageCard({ pathway }: SchemaCoverageCardProps) {
  const schemaItems = [
    `${pathway.funnelNodes.length} funnel nodes`,
    `${pathway.educationBlocks.length} education blocks`,
    `${pathway.productContributions.length} products`,
    `${pathway.optimizationRules.length} optimization rules`,
    `${pathway.aiInstructions.length} AI instructions`,
    `${pathway.personalizationRules.length} personalization rules`,
    `${pathway.selfLearningSuggestions.length} recommendations`,
    `${pathway.relationships.length} relationships`,
    `${pathway.approvalRequests.length} approvals`,
    `${pathway.followUpTimeline.length} follow-ups`,
    `${pathway.activityLogs.length} activity logs`,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Root Pathway Schema Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {schemaItems.map((item) => (
            <div key={item} className="rounded-md border bg-muted/30 p-3">
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
