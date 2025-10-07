
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeartPulse, Thermometer, Droplets, Activity, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NormalRangesCard = ({ className }: { className?: string }) => (
    <Card className={cn("shadow-lg border-primary/10", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Typical Health Baselines
        </CardTitle>
        <CardDescription>
            Common physiological ranges for a resting adult. For informational purposes only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2 p-4 bg-muted/60 rounded-lg">
                <div className="font-semibold text-foreground flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-primary/80" />
                    Heart Rate
                </div>
                <p className="text-muted-foreground">
                    <span className="text-2xl font-bold text-foreground">60-100</span> BPM
                    <br />
                    Normal resting heart rate.
                </p>
            </div>
             <div className="flex flex-col gap-2 p-4 bg-muted/60 rounded-lg">
                <div className="font-semibold text-foreground flex items-center gap-2">
                    <Wind className="w-5 h-5 text-primary/80" />
                    Respiratory Rate
                </div>
                <p className="text-muted-foreground">
                    <span className="text-2xl font-bold text-foreground">12-20</span> breaths/min
                    <br />
                    Normal resting breathing rate.
                </p>
            </div>
             <div className="flex flex-col gap-2 p-4 bg-muted/60 rounded-lg">
                <div className="font-semibold text-foreground flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-primary/80" />
                    Blood Oxygen (SpO2)
                </div>
                 <p className="text-muted-foreground">
                    <span className="text-2xl font-bold text-foreground">95-100</span> %
                    <br />
                    Oxygen saturation level.
                </p>
            </div>
             <div className="flex flex-col gap-2 p-4 bg-muted/60 rounded-lg">
                <div className="font-semibold text-foreground flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-primary/80" />
                    Body Temperature
                </div>
                <p className="text-muted-foreground">
                    <span className="text-2xl font-bold text-foreground">36.1-37.2</span> °C
                     <br />
                    Typical core body temp.
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
)
