
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Vote, Cpu, ShieldAlert, Users, BrainCircuit } from 'lucide-react';
import { EnsemblePrediction } from '@/ai/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface EnsembleStatusCardProps {
  predictions?: EnsemblePrediction[];
  isLoading: boolean;
  className?: string;
}

const moodColors: { [key: string]: string } = {
  Normal: "border-blue-400/50 text-blue-400 bg-blue-500/10",
  'Mild Stress': "border-yellow-400/50 text-yellow-400 bg-yellow-500/10",
  'High Stress': "border-orange-400/50 text-orange-400 bg-orange-500/10",
  Fatigue: "border-purple-400/50 text-purple-400 bg-purple-500/10",
  'Anxiety Spike': "border-red-500/50 text-red-500 bg-red-500/10",
  'Critical': "border-red-500/50 text-red-500 bg-red-500/10",
  'High Temp': "border-rose-500/50 text-rose-500 bg-rose-500/10",
};

const modelIcons: { [key: string]: React.ElementType } = {
    'SVM': ShieldAlert,
    'KNN': Users,
    'LSTM': Cpu,
    'Temporal Transformer': BrainCircuit,
};

export function EnsembleStatusCard({ predictions, isLoading, className }: EnsembleStatusCardProps) {
    const majorityVote = React.useMemo(() => {
        if (!predictions || predictions.length === 0) return 'N/A';
        const votes = predictions.reduce((acc, p) => {
            acc[p.prediction] = (acc[p.prediction] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(votes).reduce((a, b) => (votes[a] > votes[b] ? a : b));
    }, [predictions]);

    const ensemblePredictions = predictions;

  return (
    <Card className={cn("shadow-lg animate-in fade-in-0 duration-500 border-primary/10", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Vote className="w-5 h-5 text-primary" />
                    Lightweight Model Ensemble
                </CardTitle>
                <CardDescription>
                    Edge-optimized models provide a preliminary vote on the user's state.
                </CardDescription>
            </div>
            <div className="text-right">
                <p className="text-sm text-muted-foreground">MAJORITY VOTE</p>
                {isLoading && !predictions ? <Skeleton className="h-8 w-24 mt-1" /> : (
                    <Badge variant="outline" className={cn("text-lg font-bold mt-1 transition-all duration-300", moodColors[majorityVote] ?? '' )}>
                        {majorityVote}
                    </Badge>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (!ensemblePredictions || ensemblePredictions.length === 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ensemblePredictions?.map((p, index) => {
                const Icon = modelIcons[p.model] ?? Cpu;
                return (
                    <Card key={p.model} className="bg-muted/60 transition-all duration-500 ease-in-out animate-in fade-in-0 slide-in-from-bottom-2" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3">
                            <Icon className="w-6 h-6 text-muted-foreground" />
                            <CardTitle className="text-base font-semibold">{p.model.replace(/_/g, ' ')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center gap-2 text-center">
                            <p className="text-xs text-muted-foreground">PREDICTION</p>
                             <Badge variant="outline" className={cn("text-lg font-bold", moodColors[p.prediction] ?? '')}>
                                {p.prediction}
                            </Badge>
                             <p className="text-xs text-muted-foreground pt-1">CONFIDENCE</p>
                            <p className="font-mono text-xl font-semibold text-foreground transition-colors duration-300">
                                {(p.confidence * 100).toFixed(0)}%
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
