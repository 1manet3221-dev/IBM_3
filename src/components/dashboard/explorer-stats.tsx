
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, BarChart, Sigma, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { BlockchainRecord } from './blockchain-records-card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { subDays, format } from 'date-fns';

interface ExplorerStatsProps {
    records: BlockchainRecord[];
    isLoading: boolean;
}

export function ExplorerStats({ records, isLoading }: ExplorerStatsProps) {
    const stats = useMemo(() => {
        const validRecords = records.filter(r => r.blockId > 0);
        if (validRecords.length === 0) {
            return {
                totalBlocks: 0,
                warningCount: 0,
                criticalCount: 0,
                avgConfidence: 0,
                mostFrequentAnomaly: 'N/A',
                weeklyTrend: [],
            };
        }

        const anomalyCounts = validRecords.reduce((acc, { condition }) => {
            acc[condition] = (acc[condition] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const weeklyData = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                date: format(date, 'MMM d'),
                count: 0
            };
        });

        const sevenDaysAgo = subDays(new Date(), 7);
        validRecords.forEach(record => {
            const recordDate = new Date(record.timestamp);
            if (recordDate > sevenDaysAgo) {
                const dateString = format(recordDate, 'MMM d');
                const dayData = weeklyData.find(d => d.date === dateString);
                if (dayData) dayData.count++;
            }
        });


        return {
            totalBlocks: validRecords.length,
            warningCount: validRecords.filter(r => r.status === 'Warning').length,
            criticalCount: validRecords.filter(r => r.status === 'Critical').length,
            avgConfidence: (validRecords.reduce((acc, { confidence }) => acc + confidence, 0) / validRecords.length) * 100,
            mostFrequentAnomaly: Object.keys(anomalyCounts).length > 0
                ? Object.entries(anomalyCounts).sort(([, a], [, b]) => b - a)[0][0]
                : 'N/A',
            weeklyTrend: weeklyData,
        };
    }, [records]);

    const chartConfig = {
        count: {
          label: 'Events',
          color: "hsl(var(--primary))",
        },
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Sigma className="w-5 h-5 text-primary" />
                        AuraChain Analytics
                    </CardTitle>
                    <CardDescription>Aggregate statistics from the immutable event log.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="bg-muted/60 p-4 rounded-lg">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground text-sm font-medium">
                            <Hash className="w-4 h-4" /> Total Events
                        </div>
                        <p className="text-4xl font-bold text-foreground mt-1">{stats.totalBlocks}</p>
                    </div>
                     <div className="bg-muted/60 p-4 rounded-lg">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground text-sm font-medium text-yellow-400">
                            <ShieldAlert className="w-4 h-4" /> Warnings
                        </div>
                        <p className="text-4xl font-bold text-yellow-400 mt-1">{stats.warningCount}</p>
                    </div>
                    <div className="bg-muted/60 p-4 rounded-lg">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground text-sm font-medium text-red-500">
                            <AlertTriangle className="w-4 h-4" /> Criticals
                        </div>
                        <p className="text-4xl font-bold text-red-500 mt-1">{stats.criticalCount}</p>
                    </div>
                    <div className="bg-muted/60 p-4 rounded-lg">
                        <div className="flex justify-center items-center gap-2 text-muted-foreground text-sm font-medium">
                            <BarChart className="w-4 h-4" /> Top Anomaly
                        </div>
                        <p className="text-xl font-bold text-primary mt-2">{stats.mostFrequentAnomaly}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-lg border-primary/10">
                 <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Weekly Event Trend
                    </CardTitle>
                    <CardDescription>Number of critical and warning events logged per day.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-40 w-full">
                        <ChartContainer config={chartConfig}>
                            <AreaChart data={stats.weeklyTrend} margin={{ left: -20, right: 20, top: 10, bottom: 0 }}>
                                 <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                                 <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                                <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />}  wrapperClassName="!bg-popover/90 !border-border/80 backdrop-blur-sm !rounded-lg !shadow-xl" />
                                 <defs>
                                    <linearGradient id="fill-count" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <Area dataKey="count" type="natural" fill="url(#fill-count)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
