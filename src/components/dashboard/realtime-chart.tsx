

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Skeleton } from '../ui/skeleton';

export interface ChartDataPoint {
  timestamp: number;
  [key: string]: number;
}

interface RealtimeChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  title: string;
  icon: LucideIcon;
  unit: string;
  strokeColor: string;
  latestValue?: string;
  isLoading: boolean;
}

export function RealtimeChart({ data, dataKey, title, icon: Icon, unit, strokeColor, latestValue, isLoading }: RealtimeChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: strokeColor,
    },
  };

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="grid gap-1">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs font-mono">{unit}</CardDescription>
        </div>
        <div className="text-3xl font-bold text-foreground tracking-tighter">
          {isLoading ? <Skeleton className="h-8 w-24" /> : latestValue}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-40 w-full">
          {isLoading ? (
             <Skeleton className="h-full w-full" />
          ) : (
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={data}
                margin={{
                  left: 0,
                  right: 12,
                  top: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                 <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={true}
                  content={
                    <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                            <div className="flex flex-col gap-1.5 p-1">
                                <span className="font-bold text-base">{`${Number(value).toFixed(1)} ${unit}`}</span>
                                <span className="text-muted-foreground text-xs">{
                                  new Date(
                                    data.find(d => d[dataKey] === value)?.timestamp ?? 0
                                  ).toLocaleTimeString()
                                }</span>
                            </div>
                        )}
                    />}
                    wrapperClassName="!bg-popover/90 !border-border/80 backdrop-blur-sm !rounded-lg !shadow-xl"
                />
                <defs>
                    <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <Area
                  dataKey={dataKey}
                  type="natural"
                  fill={`url(#fill-${dataKey})`}
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  stackId="a"
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
