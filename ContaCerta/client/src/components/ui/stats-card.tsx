import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  testId?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", testId }: StatsCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm" data-testid={`${testId}-title`}>{title}</span>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="text-2xl font-bold text-foreground" data-testid={`${testId}-value`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
