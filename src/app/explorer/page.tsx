
'use client';

import { useState, useEffect } from 'react';
import { ListCollapse, BrainCircuit, Search, Sigma, BarChart, Hash } from 'lucide-react';
import { BlockchainRecord, BlockchainRecordsCard } from '@/components/dashboard/blockchain-records-card';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard } from "lucide-react";
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useBlockchainState } from '@/hooks/use-blockchain-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { ExplorerStats } from '@/components/dashboard/explorer-stats';
import { ChainVerifier } from '@/components/dashboard/chain-verifier';


function MainContent() {
  const { state } = useSidebar();
  const { records: allRecords, isLoading } = useBlockchainState();
  const [filteredRecords, setFilteredRecords] = useState<BlockchainRecord[]>([]);
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);

  useEffect(() => {
    if (debouncedFilter) {
      const lowercasedFilter = debouncedFilter.toLowerCase();
      const results = allRecords.filter(record => 
        record.condition.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredRecords(results);
    } else {
      setFilteredRecords(allRecords);
    }
  }, [debouncedFilter, allRecords]);


  return (
    <main
      className={cn(
        'transition-[margin-left] ease-in-out duration-300',
        state === 'expanded' ? 'md:ml-60' : 'md:ml-16'
      )}
    >
       <div className="bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-16 px-4 md:px-8 border-b">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="sm:hidden" />
                    <h1 className="text-xl font-bold text-foreground tracking-tight">AuraChain Explorer</h1>
                </div>
            </div>
        </div>
      <div className="p-4 md:p-8 space-y-8">
        <ExplorerStats records={allRecords} isLoading={isLoading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle>Filter & Search Logs</CardTitle>
                    <CardDescription>Use the search below to filter logs by condition (e.g., "High Stress", "Fatigue").</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by condition..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>
            <ChainVerifier />
        </div>
        <BlockchainRecordsCard
          records={filteredRecords}
          isLoading={isLoading}
          className="xl:col-span-4"
          showViewAll={false}
          filterTerm={debouncedFilter}
        />
      </div>
    </main>
  );
}


export default function ExplorerPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex-col bg-background">
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" tooltip="Dashboard">
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/analysis" tooltip="AI Analysis">
                <BrainCircuit />
                AI Analysis
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/explorer" isActive tooltip="AuraChain Explorer">
                <ListCollapse />
                Explorer
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
        <MainContent />
      </div>
    </SidebarProvider>
  );
}
