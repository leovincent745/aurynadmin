import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RootPathway } from "@/lib/domain/root-pathway";

interface RelationshipGraphPreviewProps {
  pathway: RootPathway;
}

export function RelationshipGraphPreview({ pathway }: RelationshipGraphPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relationship Graph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 text-sm lg:grid-cols-3">
          {pathway.relationships.slice(0, 6).map((relationship) => (
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
  );
}
