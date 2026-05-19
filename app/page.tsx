import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  GitBranch,
  GraduationCap,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { glpOneSupportPathway } from "@/lib/data/root-pathways";

const stats = [
  {
    label: "Active users",
    value: glpOneSupportPathway.analytics.metrics.activeUsers.toLocaleString(),
  },
  {
    label: "Engagement",
    value: `${Math.round(glpOneSupportPathway.analytics.metrics.engagementRate * 100)}%`,
  },
  {
    label: "AI suggestions",
    value: glpOneSupportPathway.analytics.metrics.openAiSuggestions.toString(),
  },
];

const navItems = [
  { label: "Overview", icon: BarChart3 },
  { label: "Funnel Flow", icon: GitBranch },
  { label: "Education", icon: GraduationCap },
  { label: "Quick Actions", icon: ListChecks },
  { label: "Products", icon: Boxes },
  { label: "Ingredients", icon: Activity },
  { label: "Optimization Rules", icon: ClipboardCheck },
  { label: "AI Instructions", icon: Bot },
  { label: "Personalization", icon: Users },
  { label: "Follow-Up Timeline", icon: CalendarDays },
  { label: "Analytics", icon: BarChart3 },
  { label: "Self Learning", icon: Sparkles },
  { label: "Physician Review", icon: Stethoscope },
  { label: "Activity Logs", icon: ShieldCheck },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r bg-muted/35 px-4 py-5 md:block">
          <div className="mb-8 px-2">
            <p className="text-lg font-semibold">Auryn Admin</p>
            <p className="text-sm text-muted-foreground">User web console</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={item.label === "Overview" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="flex h-16 items-center gap-3 border-b px-4 sm:px-6">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="Search users, orders, tickets"
                type="search"
              />
            </div>
            <Button size="icon" variant="outline" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-6 p-4 sm:p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {glpOneSupportPathway.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {glpOneSupportPathway.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader>
                    <CardTitle>{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Root Pathway Schema Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    `${glpOneSupportPathway.funnelNodes.length} funnel nodes`,
                    `${glpOneSupportPathway.educationBlocks.length} education blocks`,
                    `${glpOneSupportPathway.productContributions.length} products`,
                    `${glpOneSupportPathway.optimizationRules.length} optimization rules`,
                    `${glpOneSupportPathway.aiInstructions.length} AI instructions`,
                    `${glpOneSupportPathway.personalizationRules.length} personalization rules`,
                    `${glpOneSupportPathway.relationships.length} relationships`,
                    `${glpOneSupportPathway.followUpTimeline.length} follow-ups`,
                    `${glpOneSupportPathway.activityLogs.length} activity logs`,
                  ].map((item) => (
                    <div key={item} className="rounded-md border bg-muted/30 p-3">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationship Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm lg:grid-cols-3">
                  {glpOneSupportPathway.relationships.slice(0, 6).map((relationship) => (
                    <div key={relationship.id} className="rounded-md border bg-muted/30 p-3">
                      <p className="font-medium text-foreground">{relationship.label}</p>
                      <p className="mt-1 text-muted-foreground">
                        {relationship.source.label} {"->"} {relationship.target.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
