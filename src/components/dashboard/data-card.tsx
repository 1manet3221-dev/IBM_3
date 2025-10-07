
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface DataPoint {
  label: string;
  value: string;
}

interface DataCardProps {
  title: string;
  icon: LucideIcon;
  unit: string;
  data: DataPoint[];
  className?: string;
  isLoading?: boolean;
}

export function DataCard({ title, icon: Icon, unit, data, className, isLoading }: DataCardProps) {
  return (
    <Card className={cn('shadow-lg', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
        </CardTitle>
        <span className="text-xs font-mono text-muted-foreground">{unit}</span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
            {data.map((point) => (
                <div key={point.label} className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-2xl font-bold tracking-tighter text-foreground">{point.value}</p>
                    <p className="text-xs text-muted-foreground uppercase font-medium">{point.label}</p>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
