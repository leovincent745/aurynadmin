import Link from "next/link";
import { Construction } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FutureModulePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <Construction className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600">
        <p>
          This area is shown in the client deck for future phases. It is not part of Step 1 admin
          delivery and does not affect live Auryn chat.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Step 1 admin tools</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
