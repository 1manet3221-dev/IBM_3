

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ListCollapse, HardDrive, HeartPulse, Wind, Thermometer, Hash, Clock, ShieldAlert, AlertTriangle, Droplets } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export interface BlockchainRecord {
  blockId: number;
  condition: string;
  timestamp: string;
  confidence: number;
  hash?: string;
  previousHash?: string;
  sensor_data?: {
    HR: number;
    Resp: number;
    Temp: number;
    SpO2: number;
  };
  userID?: string;
  status?: string;
}

interface BlockchainRecordsCardProps {
  records: BlockchainRecord[];
  isLoading: boolean;
  className?: string;
  showViewAll?: boolean;
  filterTerm?: string;
}

const moodColorMap: { [key: string]: string } = {
  'High Stress': "border-orange-400/50 bg-orange-400/10 text-orange-400",
  'Fatigue': "border-purple-400/50 bg-purple-400/10 text-purple-400",
  'Nervous': "border-yellow-400/50 bg-yellow-400/10 text-yellow-400",
  'Anxiety Spike': "border-red-500/50 bg-red-500/10 text-red-500",
  'High Temp': "border-rose-500/50 bg-rose-500/10 text-rose-500",
  'Critical': "border-red-600/50 bg-red-600/10 text-red-600 animate-pulse",
  'Depressed': "border-indigo-400/50 bg-indigo-400/10 text-indigo-400",
  'Normal': "border-blue-400/50 bg-blue-400/10 text-blue-400",
  'Mild Stress': "border-yellow-400/50 bg-yellow-400/10 text-yellow-400",
};

const statusIconMap: { [key: string]: React.ElementType } = {
    'Warning': ShieldAlert,
    'Critical': AlertTriangle,
}


const DataSnapshot = ({ readings }: { readings: BlockchainRecord['sensor_data'] }) => {
    if (!readings) return null;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-muted/60 rounded-lg border mt-3">
            <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-400" />
                <div>
                    <div className="text-muted-foreground">Heart Rate</div>
                    <div className="font-mono font-semibold">{readings.HR.toFixed(0)} BPM</div>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                 <div>
                    <div className="text-muted-foreground">Resp. Rate</div>
                    <div className="font-mono font-semibold">{readings.Resp.toFixed(0)} b/min</div>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <div>
                    <div className="text-muted-foreground">Temperature</div>
                    <div className="font-mono font-semibold">{readings.Temp.toFixed(1)} °C</div>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-rose-400" />
                <div>
                    <div className="text-muted-foreground">SpO2</div>
                    <div className="font-mono font-semibold">{readings.SpO2.toFixed(1)} %</div>
                </div>
            </div>
        </div>
    )
}

const LogDetails = ({ record }: { record: BlockchainRecord }) => (
    <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3">
            <div className="flex items-start gap-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                <div>
                    <p className="font-semibold">Event Hash</p>
                    <p className="font-mono text-muted-foreground break-all">{record.hash}</p>
                </div>
            </div>
             <div className="flex items-start gap-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                <div>
                    <p className="font-semibold">Previous Hash</p>
                    <p className="font-mono text-muted-foreground break-all">{record.previousHash}</p>
                </div>
            </div>
        </div>
        <div className="text-xs space-y-2">
             <div className="flex items-start gap-2">
                <p className="font-semibold">User ID:</p>
                <p className="font-mono text-muted-foreground">{record.userID}</p>
            </div>
        </div>
    </div>
);


export function BlockchainRecordsCard({ records, isLoading, className, showViewAll = true, filterTerm }: BlockchainRecordsCardProps) {
  const recordLimit = showViewAll ? 5 : records.length;
  
  const noRecordsMessage = filterTerm
    ? `No records found for "${filterTerm}".`
    : "No critical events logged yet.";
  
  const noRecordsSubMessage = filterTerm
    ? "Try a different search term (e.g., 'Fatigue')."
    : "High-stress or fatigue events will appear here.";


  return (
    <Card className={cn('shadow-lg border-primary/10', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-primary" />
                {showViewAll ? 'AuraChain Event Log' : 'AuraChain Explorer'}
            </CardTitle>
            <CardDescription>Immutable records of critical health events.</CardDescription>
        </div>
        {showViewAll && records.length > 0 && (
          <Button asChild variant="outline" size="sm">
              <Link href="/explorer">
                  <ListCollapse className="mr-2 h-4 w-4" />
                  View All
              </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && records.length === 0 ? (
          <div className="space-y-2.5 pt-1">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ListCollapse className="mx-auto h-10 w-10" />
            <p className="mt-4 font-medium">{noRecordsMessage}</p>
            <p className="text-sm">{noRecordsSubMessage}</p>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {records.slice(0, recordLimit).map((record, index) => {
                if (record.blockId === 0) return null; // Do not render the Genesis block
                const StatusIcon = record.status ? statusIconMap[record.status] : null;
                return (
                    <div key={record.blockId} className="border bg-card/50 rounded-lg p-4 animate-in fade-in-0 duration-500" style={{ animationDelay: `${index * 50}ms`}}>
                        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
                            <div className="flex items-center gap-3 text-left">
                                <span className="font-mono text-xs text-muted-foreground py-1 px-2 bg-muted/60 rounded-md border">#{record.blockId}</span>
                                <Badge variant="outline" className={cn("font-mono font-semibold text-sm", moodColorMap[record.condition] ?? "")}>
                                  {StatusIcon && <StatusIcon className="w-3.5 h-3.5 mr-1.5" />}
                                  {record.condition} ({(record.confidence * 100).toFixed(0)}%)
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                            </div>
                        </div>
                        <DataSnapshot readings={record.sensor_data} />
                        { !showViewAll && <LogDetails record={record} /> }
                    </div>
                )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
