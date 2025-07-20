import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { headers } from "next/headers"

import "./globals.css"

import { ClientLayoutContent } from "@/components/client-layout-content" // Yangi import

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mahalla App",
  description: "Mahalla services automation web application",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false"
  const pathname = headers().get("x-pathname") || "/"

  const isLoginPage = pathname === "/login"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayoutContent defaultOpen={defaultOpen} isLoginPage={isLoginPage} pathname={pathname}>
          {children}
        </ClientLayoutContent>
      </body>
    </html>
  )
}
