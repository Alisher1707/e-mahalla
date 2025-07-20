"use client"

import { SidebarHeader } from "@/components/ui/sidebar"

import { Home, Inbox, List, BarChart2, MessageSquareText, LogOut, Sun, Moon, Globe, User } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useData } from "@/components/data-context"
import { useLanguage } from "@/components/language-provider"

export function AppSidebar() {
  const { currentUser, logout, isLoggedIn } = useData()
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  // Define allowed paths for each role
  const adminPaths = ["/dashboard", "/users", "/create-user", "/statistics", "/reviews"]
  const userPaths = ["/orders", "/profile"]

  // Primary check: If not logged in, or if on the login page, do not render the sidebar.
  // This handles the "sidebar on login page" issue directly.
  if (!isLoggedIn || pathname === "/login") {
    return null
  }

  // Secondary check: If logged in, but currentUser is null (should not happen if isLoggedIn is true, but for safety)
  // or if the current user's role does not match the expected role for the current path,
  // then also hide the sidebar. The page-level useEffects will handle the redirect.
  if (!currentUser) {
    return null
  }

  // Check if the current user's role is authorized for the current pathname.
  // If not, hide the sidebar. This handles the "sidebar on statistics when not admin" issue.
  if (currentUser.role === "admin" && !adminPaths.includes(pathname)) {
    return null
  }
  if (currentUser.role === "user" && !userPaths.includes(pathname)) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.replace("/login")
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLanguageToggle = () => {
    setLanguage(language === "uz" ? "ru" : "uz")
  }

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const adminMenuItems = [
    {
      title: t("sidebar.dashboard"),
      url: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      title: t("sidebar.users_list"),
      url: "/users",
      icon: List,
      isActive: pathname === "/users" || pathname === "/create-user",
    },
    {
      title: t("sidebar.statistics"),
      url: "/statistics",
      icon: BarChart2,
      isActive: pathname === "/statistics",
    },
    {
      title: t("sidebar.reviews"),
      url: "/reviews",
      icon: MessageSquareText,
      isActive: pathname === "/reviews",
    },
  ]

  const userMenuItems = [
    {
      title: t("orders.title"),
      url: "/orders",
      icon: Inbox,
      isActive: pathname === "/orders",
    },
    {
      title: t("profile.title"),
      url: "/profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ]

  // Determine which menu items to show based on the current user's role
  const menuItems = currentUser?.role === "admin" ? adminMenuItems : userMenuItems

  return (
    <Sidebar className="sidebar">
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Globe className="size-6 text-foreground" />
          <span className="text-lg font-semibold">Mahalla App</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link
                      href={item.url}
                      onClick={() => isMobile && setOpenMobile(false)}
                      className="flex items-center gap-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2 p-2">
        <div className="flex items-center justify-between gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLanguageToggle}
            aria-label="Toggle language"
            className="h-8 w-8 text-foreground hover:bg-secondary"
          >
            <span className="text-xs font-bold">{language === "uz" ? "РУС" : "UZB"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
            className="h-8 w-8 text-foreground hover:bg-secondary"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>{t("sidebar.logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
