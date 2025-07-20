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
  pathname: string
}

export function ClientLayoutContent({ children, defaultOpen, isLoginPage, pathname }: ClientLayoutContentProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <ToastProvider>
          <LanguageProvider>
            <DataProvider>
              <SidebarProvider defaultOpen={defaultOpen}>
                {!isLoginPage && <AppSidebar />}
                <SidebarInset className={cn("h-screen", isLoginPage ? "w-full" : "md:ml-[20%] md:w-[calc(100%-20%)]")}>
                  <main
                    className={cn(
                      isLoginPage
                        ? "flex-1 flex justify-start pt-40 px-0" // <<<<<< BU YERDA O'ZGARTIRILDI: pl-60 o'rniga px-0, items-center olib tashlandi
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
