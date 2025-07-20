"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { MenuIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { SidebarContextType } from "@/components/ui/sidebar-context"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [openMobile, setOpenMobile] = React.useState(false)
  const pathname = usePathname()

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname])

  // Determine if it's a mobile view (less than md breakpoint)
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // Tailwind's md breakpoint is 768px
    }
    handleResize() // Set initial value
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const value = React.useMemo(
    () => ({
      openMobile,
      setOpenMobile,
      isMobile,
    }),
    [openMobile, isMobile],
  )

  return (
    <TooltipProvider>
      <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    </TooltipProvider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function Sidebar({ children, className }: React.ComponentProps<"aside">) {
  const { openMobile, setOpenMobile, isMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className={cn("w-64 p-0 border-r-0 sheet-content-sidebar", className)}>
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return <aside className={cn("hidden md:flex flex-col border-r", className)}>{children}</aside>
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { setOpenMobile, isMobile } = useSidebar()
  const pathname = usePathname() // Get pathname here

  // Do not render the trigger if on the login page or not mobile
  if (pathname === "/login" || !isMobile) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpenMobile(true)}
      className={cn("md:hidden", className)}
      {...props}
    >
      <MenuIcon className="h-6 w-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export function SidebarInset({ children, className }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col min-h-screen w-full mx-auto", className)}>{children}</div>
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center p-4", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-auto p-4", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col p-4 border-t", className)} {...props} />
}

export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4", className)} {...props} />
}

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"

    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"
        className={cn(
          "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-sidebar="group-action"
        className={cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 after:md:hidden",
          "group-data-[collapsible=icon]:hidden",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupAction.displayName = "SidebarGroupAction"

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />
  ),
)
SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-2", className)} {...props} />
  ),
)
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
  ),
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-3 text-left text-base outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-10 text-base", // Increased height and font size
        sm: "h-9 rounded-md px-3 text-sm", // Adjusted sm size
        lg: "h-12 text-lg group-data-[collapsible=icon]:!p-0", // Adjusted lg size
        icon: "h-10 w-10", // Adjusted icon size
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { isMobile } = useSidebar() // Removed 'state' as it's not exposed by this project's useSidebar

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      {/* Tooltip only shows on desktop, not mobile */}
      <TooltipContent side="right" align="center" hidden={isMobile} {...tooltip} />
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  ),
)
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ ...props }, ref) => (
  <li ref={ref} {...props} />
))
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    const { setOpenMobile, isMobile } = useSidebar()

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={() => setOpenMobile(!isMobile)}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = "SidebarRail"

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        data-sidebar="input"
        className={cn(
          "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInput.displayName = "SidebarInput"
