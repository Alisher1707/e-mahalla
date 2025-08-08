"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DataProvider } from "@/components/data-context"
import { LanguageProvider } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastProvider } from "@/components/ui/toast"

interface ClientLayoutContentProps {
  children: React.ReactNode
  defaultOpen: boolean
  isLoginPage: boolean
}

export function ClientLayoutContent({ children, defaultOpen, isLoginPage }: ClientLayoutContentProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <ToastProvider>
          <LanguageProvider>
            <DataProvider>
              <SidebarProvider defaultOpen={defaultOpen}>
                {!isLoginPage && <AppSidebar />}
                <SidebarInset className={cn("min-h-screen", isLoginPage ? "w-full" : "md:ml-[20%] md:w-[calc(100%-20%)]")}>
                  <main
                    className={cn(
                      isLoginPage
                        ? "h-screen w-full relative"
                        : "flex-1 p-4 md:p-6 overflow-x-auto mx-auto max-w-screen-xl",
                    )}
                  >
                    {!isLoginPage && <SidebarTrigger className="mb-4 md:hidden" />}
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </DataProvider>
          </LanguageProvider>
        </ToastProvider>
      </TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}
