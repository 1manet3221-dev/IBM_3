
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BellRing, PlusCircle, Trash2, Pill, Stethoscope, AlarmClock } from 'lucide-react';
import { Reminder } from '@/ai/types';
import { cn } from '@/lib/utils';
import { format, differenceInMinutes, parseISO } from 'date-fns';

interface ReminderCardProps {
    reminders: Reminder[];
    onRemindersChange: (reminders: Reminder[]) => void;
}

const typeIcons = {
    Medication: <Pill className="w-4 h-4 text-blue-400" />,
    Appointment: <Stethoscope className="w-4 h-4 text-green-400" />,
};

export function ReminderCard({ reminders, onRemindersChange }: ReminderCardProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [time, setTime] = useState('');
    const [type, setType] = useState<'Medication' | 'Appointment'>('Medication');
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const handleAddReminder = () => {
        if (!title || !time || !date) return;
        const newReminder: Reminder = {
            id: crypto.randomUUID(),
            title,
            time: `${date}T${time}`,
            type,
        };
        onRemindersChange([...reminders, newReminder].sort((a, b) => a.time.localeCompare(b.time)));
        setTitle('');
        setTime('');
    };

    const handleDeleteReminder = (id: string) => {
        onRemindersChange(reminders.filter(r => r.id !== id));
    };

    return (
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-primary" />
                    Medication & Appointment Reminders
                </CardTitle>
                <CardDescription>
                    Add reminders to provide more context to the AI.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Add New Reminder</h4>
                    <div className="flex flex-col gap-2">
                        <Input
                            placeholder="e.g., Blood pressure pill"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                        <Select value={type} onValueChange={(v: 'Medication' | 'Appointment') => setType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Medication">Medication</SelectItem>
                                <SelectItem value="Appointment">Appointment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <Button onClick={handleAddReminder} className="w-full">
                        <PlusCircle className="mr-2" /> Add Reminder
                    </Button>
                </div>
                <div className="space-y-3 pt-4">
                     <h4 className="text-sm font-medium">Upcoming</h4>
                     {reminders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No reminders set.</p>
                     ) : (
                        <div className="space-y-2">
                            {reminders.map(reminder => {
                                const reminderDateTime = parseISO(reminder.time);
                                const isUpcoming = differenceInMinutes(reminderDateTime, now) <= 30 && differenceInMinutes(reminderDateTime, now) > 0;

                                return (
                                <div key={reminder.id} className={cn("flex items-center justify-between p-3 bg-muted/60 rounded-lg transition-all", isUpcoming && "bg-yellow-500/20 border-yellow-500/50 border animate-pulse")}>
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
                                     <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteReminder(reminder.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            )})}
                        </div>
                     )}
                </div>
            </CardContent>
        </Card>
    );
}
