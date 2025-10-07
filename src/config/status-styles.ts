
import { BrainCircuit, Smile, ShieldAlert, AlertTriangle, Battery, Frown, Thermometer, Meh, RefreshCw } from 'lucide-react';
import type { Emotion, Status } from '@/ai/types';

type StyleConfig = { icon: React.ElementType, color: string, bgColor: string };

export const emotionConfig: Record<Emotion | 'default', StyleConfig> = {
    'Normal': { icon: Smile, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    'Happy': { icon: Smile, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    'Mild Stress': { icon: ShieldAlert, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
    'Nervous': { icon: ShieldAlert, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
    'High Stress': { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    'Anxiety Spike': { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    'Sad': { icon: Frown, color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
    'Depressed': { icon: Meh, color: 'text-indigo-400', bgColor: 'bg-indigo-400/10' },
    'Fatigue': { icon: Battery, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    'Burnout': { icon: Battery, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    'High Temp': { icon: Thermometer, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
    'Critical': { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-600/10' },
    'default': { icon: BrainCircuit, color: 'text-muted-foreground', bgColor: 'bg-muted' }
};

export const statusConfig: Record<Status | 'default', StyleConfig> = {
    Normal: { icon: Smile, color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20' },
    Warning: { icon: ShieldAlert, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20' },
    Critical: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-600/10 border-red-600/20' },
    Recovery: { icon: RefreshCw, color: 'text-green-500', bgColor: 'bg-green-500/10 border-green-500/20' },
    default: { icon: BrainCircuit, color: 'text-muted-foreground', bgColor: 'bg-muted border-border' }
};
