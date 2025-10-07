
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BellRing, Pill, Stethoscope, AlarmClock, CalendarOff } from 'lucide-react';
import { Reminder } from '@/ai/types';
import { cn } from '@/lib/utils';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface AnalysisRemindersCardProps {
    reminders: Reminder[];
    isLoading: boolean;
    className?: string;
}

const typeIcons = {
    Medication: <Pill className="w-4 h-4 text-blue-400" />,
    Appointment: <Stethoscope className="w-4 h-4 text-green-400" />,
};

export function AnalysisRemindersCard({ reminders, isLoading, className }: AnalysisRemindersCardProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    if (isLoading) {
        return <Skeleton className={cn("h-48 w-full", className)} />;
    }

    return (
        <Card className={cn("shadow-lg animate-in fade-in-0 duration-500 border-primary/10", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-primary" />
                    Active Reminders
                </CardTitle>
                <CardDescription>
                    Reminders providing context to the AI during this analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                 {reminders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                        <CalendarOff className="mx-auto h-8 w-8" />
                        <p className="mt-2 font-medium">No Active Reminders</p>
                        <p className="text-sm">The AI had no reminder context for this analysis.</p>
                    </div>
                 ) : (
                    <div className="space-y-2">
                        {reminders.map(reminder => {
                            const reminderDateTime = parseISO(reminder.time);
                            const isUpcoming = differenceInMinutes(reminderDateTime, now) <= 30 && differenceInMinutes(reminderDateTime, now) > 0;

                            return (
                            <div key={reminder.id} className={cn("flex items-center justify-between p-3 bg-muted/60 rounded-lg transition-all", isUpcoming && "bg-yellow-500/20 border-yellow-500/50 border")}>
                                <div className="flex items-center gap-3">
                                    {isUpcoming ? <AlarmClock className="w-4 h-4 text-yellow-400" /> : typeIcons[reminder.type]}
                                    <div>
                                        <p className="font-semibold">{reminder.title}</p>
                                        <p className="text-xs text-muted-foreground">{reminder.type}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-mono text-sm">{format(reminderDateTime, 'h:mm a')}</span>
                                    <span className="font-mono text-xs text-muted-foreground">{format(reminderDateTime, 'MMM d')}</span>
                                </div>
                            </div>
                        )})}
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
