import { AdminShell } from "@/components/layout/admin-shell";
import { pathwayNavItems } from "@/components/pathways/pathway-nav";
import { RootPathwayOverview } from "@/components/pathways/root-pathway-overview";
import { glpOneSupportPathway } from "@/lib/data/root-pathways";

export default function GlpOneSupportPage() {
  return (
    <AdminShell navItems={pathwayNavItems} breadcrumbs={["Root Pathways", "GLP-1 Support"]}>
      <RootPathwayOverview pathway={glpOneSupportPathway} />
    </AdminShell>
  );
}
