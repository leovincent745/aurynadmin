import { PathwayMetrics } from "@/components/pathways/pathway-metrics";
import { PathwayPageHeader } from "@/components/pathways/pathway-page-header";
import { PathwayTabs } from "@/components/pathways/pathway-tabs";
import type { RootPathway } from "@/lib/domain/root-pathway";

interface RootPathwayOverviewProps {
  pathway: RootPathway;
}

export function RootPathwayOverview({ pathway }: RootPathwayOverviewProps) {
  return (
    <>
      <PathwayPageHeader pathway={pathway} />
      <PathwayMetrics pathway={pathway} />
      <PathwayTabs />
    </>
  );
}
