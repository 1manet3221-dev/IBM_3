import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
  isLoading: boolean;
  className?: string;
}

export function InsightCard({ title, icon: Icon, content, isLoading, className }: InsightCardProps) {
  return (
    <Card className={cn('shadow-md h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
           <Icon className="h-5 w-5 text-primary" />
           {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground">
        {isLoading ? (
          <div className="space-y-2.5 pt-1">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}
