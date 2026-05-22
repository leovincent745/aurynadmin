import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminPlaceholderProps {
  title: string;
  featureLabel: string;
  description: string;
}

export function AdminPlaceholder({ title, featureLabel, description }: AdminPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-600">
        <p>{description}</p>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Planned in <span className="font-medium text-slate-700">{featureLabel}</span>. This route
          is wired for navigation and access control.
        </p>
      </CardContent>
    </Card>
  );
}
