
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, MessageSquareHeart, TrendingUp } from 'lucide-react';
import { HolisticAnalysisOutput } from '@/ai/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface HolisticAnalysisCardProps {
  analysis?: HolisticAnalysisOutput | null;
  isLoading: boolean;
  className?: string;
}


const stateColorMap: { [key: string]: string } = {
    'Normal': 'text-cyan-400',
    'Mild Stress': 'text-yellow-400',
    'High Stress': 'text-orange-400',
    'Fatigue': 'text-purple-400',
    'Anxiety Spike': 'text-red-500',
    'Critical': 'text-red-500',
    'default': 'text-muted-foreground'
};

export function HolisticAnalysisCard({ analysis, isLoading, className }: HolisticAnalysisCardProps) {
    if (isLoading && !analysis) {
        return <Skeleton className={cn("h-80 w-full", className)} />;
    }

    if (!analysis) {
        return (
            <Card className={cn("flex items-center justify-center h-80", className)}>
                <CardContent className="text-center">
                    <BrainCircuit className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="mt-4 text-muted-foreground">Awaiting AI analysis...</p>
                </CardContent>
            </Card>
        )
    }
    
    const stateColor = stateColorMap[analysis.state] ?? stateColorMap.default;

  return (
    <Card className={cn('shadow-lg animate-in fade-in-0 duration-500 border-primary/10', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          Holistic AI Analysis
        </CardTitle>
        <CardDescription>
          The final assessment from the AI model, combining sensor data and model predictions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center gap-2 border-b border-border pb-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Final Detected State</p>
            <h3 className={cn('text-6xl font-extrabold tracking-tighter transition-colors duration-300', stateColor)}>{analysis.state}</h3>
            <div className="w-full max-w-xs mt-2">
                 <p className="font-mono text-xl text-foreground mb-1.5">
                    {(analysis.confidence * 100).toFixed(1)}% Confidence
                </p>
                <Progress value={analysis.confidence * 100} className="h-3" />
            </div>
        </div>
        <div className="space-y-6 text-base">
            <div className="flex items-start gap-4">
                <TrendingUp className="w-7 h-7 text-primary/80 shrink-0 mt-1" />
                <div>
                    <h4 className="font-semibold text-foreground mb-1">AI Reasoning</h4>
                    <p className="text-muted-foreground">{analysis.reasoning}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <MessageSquareHeart className="w-7 h-7 text-primary/80 shrink-0 mt-1" />
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Recommended Action</h4>
                    <p className="text-muted-foreground">{analysis.action}</p>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
