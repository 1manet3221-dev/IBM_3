
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BrainCircuit, MessageSquareHeart, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAiState } from '@/hooks/use-ai-state';
import { fetchBlockchainRecords } from '@/hooks/use-blockchain-state';

const statusColorMap: { [key: string]: string } = {
  'Analyzing': 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400',
  'Completed': 'border-green-400/50 bg-green-400/10 text-green-400',
  'Error': 'border-red-500/50 bg-red-500/10 text-red-500',
  'Initializing': 'border-gray-500/50 bg-gray-500/10 text-gray-500'
};

const stateColorMap: { [key: string]: string } = {
    'Normal': 'text-cyan-400',
    'Mild Stress': 'text-yellow-400',
    'High Stress': 'text-orange-400',
    'Fatigue': 'text-purple-400',
    'Anxiety Spike': 'text-red-500',
    'Critical': 'text-red-500',
    'default': 'text-muted-foreground'
};


export function LiveStatusCard({ onCriticalEvent }: { onCriticalEvent: () => void }) {
  const { aiState, isLoading, error } = useAiState();
  
  const getUiStatus = () => {
    if (isLoading) return 'Analyzing';
    if (error) return 'Error';
    if (aiState) return 'Completed';
    return 'Initializing';
  }

  const uiStatus = getUiStatus();
  
  React.useEffect(() => {
    if (aiState?.isCritical) {
      onCriticalEvent();
    }
  }, [aiState, onCriticalEvent]);

  const renderCardContent = () => {
    if (isLoading && !aiState) {
      return (
         <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
            <div className="relative flex items-center justify-center w-24 h-24">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                <Activity className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-4xl font-bold text-muted-foreground">Analyzing...</h3>
            <Badge variant="outline" className={cn(statusColorMap['Analyzing'])}>
                AI Status: Analyzing
            </Badge>
        </div>
      );
    }
    
    if (!aiState) {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
          <div className={cn('flex items-center justify-center p-5 rounded-full w-24 h-24 transition-all duration-300 bg-muted/80')}>
            <BrainCircuit className={cn('w-12 h-12', 'text-muted-foreground')} />
          </div>
          <h3 className={cn('text-4xl font-bold', 'text-muted-foreground')}>Initializing...</h3>
          <Badge variant="secondary">
            Status: Awaiting first sensor reading...
          </Badge>
        </div>
      );
    }
    
    const stateColor = stateColorMap[aiState.state] ?? stateColorMap.default;

    return (
      <div key={aiState.state} className="flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-500">
        <div className="mt-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Current Detected State</p>
          <h3 className={cn('text-6xl font-extrabold tracking-tighter transition-colors duration-300', stateColor)}>{aiState.state}</h3>
        </div>
        <div className='flex flex-col gap-3 items-center mt-2'>
           <Badge variant="outline" className={cn("text-sm font-semibold border-2 transition-colors duration-300", statusColorMap[uiStatus])}>
            AI Status: {uiStatus} ({(aiState.confidence * 100).toFixed(0)}% Confident)
          </Badge>
          <div className="text-base text-muted-foreground px-4 mt-2 text-balance flex items-start gap-2.5 max-w-2xl">
            <MessageSquareHeart className="w-6 h-6 text-primary/80 shrink-0 mt-0.5"/> 
            <p className="text-left">{aiState.action}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('h-full border-primary/20')}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          Live AI Status
        </CardTitle>
        <Button asChild variant="outline" size="sm" className="bg-card/50 hover:bg-accent/80 hover:text-accent-foreground" disabled={!aiState}>
          <Link href="/analysis">
            View Full Analysis
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {renderCardContent()}
      </CardContent>
    </Card>
  );
}
