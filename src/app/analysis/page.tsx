
'use client'

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ListCollapse,
  BrainCircuit,
} from "lucide-react";
import {
  cn
} from '@/lib/utils';
import {
  useAiState
} from '@/hooks/use-ai-state';
import {
  EnsembleStatusCard
} from '@/components/dashboard/ensemble-status-card';
import {
  useSidebar
} from "@/components/ui/sidebar";
import Link from 'next/link';
import {
  Skeleton
} from "@/components/ui/skeleton";
import { HolisticAnalysisCard } from "@/components/dashboard/holistic-analysis-card";
import { BaselineComparisonCard } from "@/components/dashboard/baseline-comparison-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisRemindersCard } from "@/components/dashboard/analysis-reminders-card";


function MainContent() {
  const {
    state
  } = useSidebar();
  const {
    aiState,
    isLoading,
    sensorData,
    userBaseline,
    reminders
  } = useAiState();

  const renderContent = () => {
    const isPageLoading = isLoading && !aiState;
    
    if (isPageLoading) {
      return ( 
        <div className = "p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8" >
            <Skeleton className = "h-80 w-full lg:col-span-2" />
            <Skeleton className = "h-96 w-full" />
            <Skeleton className = "h-96 w-full" />
        </div>
      );
    }

    if (aiState) {
      return (
        <div className="p-4 md:p-8">
            <Tabs defaultValue="holistic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="holistic">Holistic Analysis (LLM)</TabsTrigger>
                    <TabsTrigger value="models">Model Breakdown (ML)</TabsTrigger>
                </TabsList>
                <TabsContent value="holistic" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <HolisticAnalysisCard 
                            analysis={aiState}
                            isLoading={isLoading}
                            className="lg:col-span-2"
                        />
                         <div className="space-y-8">
                            <BaselineComparisonCard 
                                current={sensorData}
                                baseline={userBaseline}
                                isLoading={isLoading}
                            />
                            <AnalysisRemindersCard
                                reminders={reminders ?? []}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="models" className="space-y-8">
                     <EnsembleStatusCard 
                        predictions={aiState.localPredictions}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
      );
    }

    return (
      <div className = "p-4 md:p-8 text-center animate-in fade-in-0 duration-500" >
        <div className = "flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-card" >
            <BrainCircuit className = "w-16 h-16 text-muted-foreground" / >
            <h2 className = "mt-4 text-xl font-semibold" > No AI Analysis Data Available </h2>
            <p className = "mt-1 text-muted-foreground" >
            Return to the <Link href = "/" className = "text-primary hover:underline" > Dashboard </Link> to see the live analysis.
            </p>
            <p className = "text-xs text-muted-foreground mt-2" >
            This page automatically displays the latest analysis once it's available.
            </p>
        </div>
      </div>
    );
  };

  return (
    <main className = {cn('transition-[margin-left] ease-in-out duration-300',
        state === 'expanded' ? 'md:ml-60' : 'md:ml-16'
      )} >
    <div className = "bg-background/80 backdrop-blur-sm sticky top-0 z-10" >
    <div className = "flex items-center justify-between h-16 px-4 md:px-8 border-b" >
    <div className = "flex items-center gap-3" >
    <SidebarTrigger className = "sm:hidden" / >
    <h1 className = "text-xl font-bold text-foreground tracking-tight" > AI Analysis </h1>
    </div>
    </div>
    </div>
    {renderContent()}
    </main>
  );
}


export default function AnalysisPage() {
  return (
    <SidebarProvider >
    <div className = "min-h-screen w-full flex-col bg-background" >
    <Sidebar >
    <SidebarMenu >
    <SidebarMenuItem >
    <SidebarMenuButton href = "/" tooltip = "Dashboard" >
    <LayoutDashboard / >
    Dashboard
    </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem >
    <SidebarMenuButton href = "/analysis" isActive tooltip = "AI Analysis" >
    <BrainCircuit / >
    AI Analysis
    </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem >
    <SidebarMenuButton href = "/explorer" tooltip = "AuraChain Explorer" >
    <ListCollapse / >
    Explorer
    </SidebarMenuButton>
    </SidebarMenuItem>
    </SidebarMenu>
    </Sidebar>
    <MainContent / >
    </div>
    </SidebarProvider>
  );
}
