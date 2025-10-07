
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, HeartPulse, Wind, Thermometer, Droplets, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { RecentReadings, SensorStats } from '@/ai/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface BaselineComparisonCardProps {
  current?: RecentReadings | null;
  baseline?: RecentReadings | null;
  isLoading: boolean;
  className?: string;
}

const getChangeIndicator = (currentAvg: number, baselineAvg: number) => {
    const diff = currentAvg - baselineAvg;
    const threshold = baselineAvg * 0.1; // 10% change
    if (diff > threshold) return { Icon: ArrowUp, color: 'text-orange-400' };
    if (diff < -threshold) return { Icon: ArrowDown, color: 'text-purple-400' };
    return { Icon: Minus, color: 'text-muted-foreground' };
}

const StatRow = ({ label, icon: Icon, unit, current, baseline }: { label: string, icon: React.ElementType, unit: string, current?: SensorStats | null, baseline?: SensorStats | null }) => {
    if (!current || !baseline) {
        return (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-1/4" />
            </div>
        );
    }
    const { Icon: ChangeIcon, color } = getChangeIndicator(current.avg, baseline.avg);
    
    return (
        <div className="flex items-center justify-between p-3 bg-muted/60 rounded-lg text-sm">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary/80" />
                <span className="font-medium text-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-4 font-mono">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-right cursor-default">
                                {current.avg.toFixed(unit === '°C' ? 1 : 0)}
                                <span className="text-xs text-muted-foreground"> {unit}</span>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Min: {current.min.toFixed(1)} / Max: {current.max.toFixed(1)}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-1.5">
                    <ChangeIcon className={cn("w-4 h-4", color)} />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className={cn("font-semibold cursor-default", color)}>
                                    {baseline.avg.toFixed(unit === '°C' ? 1 : 0)}
                                </span>
                            </TooltipTrigger>
                             <TooltipContent>
                                <p>Your Normal Baseline</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};


export function BaselineComparisonCard({ current, baseline, isLoading, className }: BaselineComparisonCardProps) {
  return (
    <Card className={cn("shadow-lg animate-in fade-in-0 duration-500 border-primary/10", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Sensor Data vs. Baseline
        </CardTitle>
        <CardDescription>
          Comparison of recent readings against your normal physiological baseline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground px-3">
            <span className="ml-[3.2rem]">Current</span>
            <span className="mr-1">Baseline</span>
        </div>
        <StatRow label="Heart Rate" icon={HeartPulse} unit="BPM" current={current?.heartRate} baseline={baseline?.heartRate} />
        <StatRow label="Resp. Rate" icon={Wind} unit="b/min" current={current?.respiratoryRate} baseline={baseline?.respiratoryRate} />
        <StatRow label="Temperature" icon={Thermometer} unit="°C" current={current?.temperature} baseline={baseline?.temperature} />
        <StatRow label="SpO2" icon={Droplets} unit="%" current={current?.spo2} baseline={baseline?.spo2} />
      </CardContent>
    </Card>
  );
}
