import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface PredictionCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  className?: string;
}

export function PredictionCard({ title, value, icon: Icon, className }: PredictionCardProps) {
  return (
    <Card className={cn('shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value.toFixed(0)}%</div>
        <Progress value={value} className="mt-2 h-2" />
      </CardContent>
    </Card>
  );
}
