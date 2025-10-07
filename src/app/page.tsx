
'use client'

import React from 'react';
import { DashboardClient } from "@/components/dashboard/client";
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, ListCollapse, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex-col bg-background">
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/" isActive tooltip="Dashboard">
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
              <SidebarMenuButton href="/explorer" tooltip="Blockchain Explorer">
                <ListCollapse />
                Explorer
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
        <DashboardClient />
      </div>
    </SidebarProvider>
  );
}
