

'use client';

import React, {
  useState,
  useEffect,
} from 'react';
import {
  HeartPulse,
  Thermometer,
  Wind,
  Droplets,
  Newspaper,
  Bot,
} from 'lucide-react';
import {
  RealtimeChart
} from './realtime-chart';
import {
  BlockchainRecordsCard,
  BlockchainRecord,
} from './blockchain-records-card';
import {
  useSensorSimulation
} from '@/hooks/use-sensor-simulation';
import {
  useSidebar,
  SidebarTrigger
} from '@/components/ui/sidebar';
import {
  cn
} from '@/lib/utils';
import {
  LiveStatusCard
} from './live-status-card';
import {
  NormalRangesCard
} from './normal-ranges-card';
import {
  setAiState
} from '@/hooks/use-ai-state';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { generateDigest } from '@/lib/actions';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { ReminderCard } from './reminders-card';
import { Reminder } from '@/ai/types';
import { useBlockchainState } from '@/hooks/use-blockchain-state';


const WeeklyReport = ({records}: {records: BlockchainRecord[]}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [digest, setDigest] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setDigest('');
        try {
            const result = await generateDigest(records);
            setDigest(result);
        } catch (error) {
            console.error(error);
            setDigest('Failed to generate report. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if(open && !digest) { // Only generate if not already generated
            handleGenerate();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <Button variant="outline" className="bg-transparent backdrop-blur-sm">
                    <Newspaper className="mr-2" />
                    Weekly Report
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Newspaper className="w-6 h-6 text-primary" />
                        Your Weekly Health Report
                    </DialogTitle>
                    <DialogDescription>
                        An AI-generated summary of your health trends and notable events from the past week.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[50vh] pr-4 -mr-4">
                     {isLoading ? (
                        <div className="space-y-4 p-1">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-6 w-1/3 mt-4" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-6 w-1/3 mt-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[80%]" />
                        </div>
                    ) : (
                        <div
                            className="prose prose-sm dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary"
                            dangerouslySetInnerHTML={{ __html: digest }}
                        />
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

export function DashboardClient({ children }: { children?: React.ReactNode }) {
  const {
    dataHistory,
    isInitialDataLoading,
  } = useSensorSimulation();
  
  const { records: blockchainLog, isLoading: isBlockchainLoading } = useBlockchainState();

  const {
    state: sidebarState
  } = useSidebar();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);

   useEffect(() => {
    // When the user connects/disconnects their wallet,
    // update the AI state and clear any reminders.
    setAiState({ reminders: [] });
    setReminders([]);
  }, []);

  const handleRemindersChange = (newReminders: Reminder[]) => {
    setReminders(newReminders);
    // Also update the global AI state so the AI can see the reminders.
    setAiState({ reminders: newReminders });
  }

  const lastDataPoint =
    dataHistory.length > 0 ? dataHistory[dataHistory.length - 1] : {};

  return (
    <main className = {
      cn(
        'transition-[margin-left] ease-in-out duration-300',
        sidebarState === 'expanded' ? 'md:ml-60' : 'md:ml-16'
      )
    } >
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-2 mr-auto">
        <SidebarTrigger className = "sm:hidden" />
        <Bot className="w-7 h-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          AuraChain Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-4">
          <WeeklyReport records={blockchainLog} />
      </div>
    </div>

    <div className = "p-4 md:p-8 space-y-8 animate-in fade-in-0 duration-500" >
      {children}
    <div className = "grid grid-cols-1 lg:grid-cols-3 gap-8" >
    <div className="lg:col-span-3">
        <LiveStatusCard onCriticalEvent={() => {}}/>
    </div>
    </div>

     <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
             <div className = "grid grid-cols-1 md:grid-cols-2 gap-8" >
                <RealtimeChart data = {
                  dataHistory
                }
                dataKey = "heartRate"
                title = "Heart Rate"
                icon = {
                  HeartPulse
                }
                unit = "BPM"
                strokeColor = "hsl(var(--chart-1))"
                isLoading = {
                  isInitialDataLoading
                }
                latestValue = {
                  lastDataPoint.heartRate ?
                  lastDataPoint.heartRate?.toFixed(0) :
                    undefined
                }
                /> <
                RealtimeChart data = {
                  dataHistory
                }
                dataKey = "respiratoryRate"
                title = "Respiratory Rate"
                icon = {
                  Wind
                }
                unit = "breaths/min"
                strokeColor = "hsl(var(--chart-2))"
                isLoading = {
                  isInitialDataLoading
                }
                latestValue = {
                  lastDataPoint.respiratoryRate ? lastDataPoint.respiratoryRate?.toFixed(0) : undefined
                }
                /> <
                RealtimeChart data = {
                  dataHistory
                }
                dataKey = "temperature"
                title = "Body Temperature"
                icon = {
                  Thermometer
                }
                unit = "°C"
                strokeColor = "hsl(var(--chart-4))"
                isLoading = {
                  isInitialDataLoading
                }
                latestValue = {
                  lastDataPoint.temperature ?
                  lastDataPoint.temperature?.toFixed(1) :
                    undefined
                }
                /> <
                RealtimeChart data = {
                  dataHistory
                }
                dataKey = "spo2"
                title = "Blood Oxygen (SpO2)"
                icon = {
                  Droplets
                }
                unit = "%"
                strokeColor = "hsl(var(--chart-5))"
                isLoading = {
                  isInitialDataLoading
                }
                latestValue = {
                  lastDataPoint.spo2 ? lastDataPoint.spo2?.toFixed(1) : undefined
                }
                />
            </div>
             <NormalRangesCard / >
        </div>

        <div className="space-y-8">
            <ReminderCard reminders={reminders} onRemindersChange={handleRemindersChange} />
            <BlockchainRecordsCard 
              records = {blockchainLog}
              isLoading = {isBlockchainLoading}
            />
        </div>
    </div>
    </div>
    </main>
  );
}
