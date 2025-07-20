"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileDown, MessageSquare } from "lucide-react"
import { useData, type Order, type OrderStatus } from "@/components/data-context"
import { StatusBadge } from "@/components/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/components/language-context"

export default function DashboardPage() {
  const { orders, cancelOrder, getReviewById, getUserById, currentUser, isLoggedIn } = useData()
  const { t } = useLanguage()
  const router = useRouter()

  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [selectedOrderForComments, setSelectedOrderForComments] = useState<Order | null>(null)

  const filteredOrders = useMemo(() => {
    let filtered = orders

    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [orders, filterStatus, searchTerm])

  // Protect route: only accessible by admin
  useEffect(() => {
    if (!isLoggedIn || currentUser?.role !== "admin") {
      router.replace("/login") // Redirect to login if not admin or not logged in
    }
  }, [isLoggedIn, currentUser, router])

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId)
  }

  const handleExportCsv = () => {
    const headers = [
      t("dashboard.table.id"),
      t("dashboard.table.user"),
      t("dashboard.table.type"),
      t("dashboard.table.description"),
      t("dashboard.table.date"),
      t("dashboard.table.status"),
    ]
    const rows = filteredOrders.map((order) => [
      order.id,
      order.userId,
      t(`orders.order_type.${order.type}`),
      order.description.replace(/"/g, '""'), // Escape quotes for CSV
      new Date(order.date).toLocaleString(),
      t(`dashboard.${order.status}`),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((field) => `"${field}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "orders.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleViewComments = (order: Order) => {
    setSelectedOrderForComments(order)
    setShowCommentsModal(true)
  }

  const review = selectedOrderForComments?.commentId ? getReviewById(selectedOrderForComments.commentId) : null
  const reviewUser = review ? getUserById(review.userId) : null

  // Render nothing or a loading state if not authorized
  if (!isLoggedIn || currentUser?.role !== "admin") {
    return null // Or a loading spinner/message
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder={t("dashboard.filter_status")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant={filterStatus === "all" ? "default" : "outline"} onClick={() => setFilterStatus("all")}>
            {t("dashboard.all")}
          </Button>
          <Button variant={filterStatus === "open" ? "default" : "outline"} onClick={() => setFilterStatus("open")}>
            {t("dashboard.open")}
          </Button>
          <Button variant={filterStatus === "closed" ? "default" : "outline"} onClick={() => setFilterStatus("closed")}>
            {t("dashboard.closed")}
          </Button>
          <Button
            variant={filterStatus === "canceled" ? "default" : "outline"}
            onClick={() => setFilterStatus("canceled")}
          >
            {t("dashboard.canceled")}
          </Button>
        </div>
        <Button onClick={handleExportCsv} className="ml-auto">
          <FileDown className="mr-2 h-4 w-4" /> {t("dashboard.export_csv")}
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] table-header-text">{t("dashboard.table.id")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.user")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.type")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.description")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.date")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.status")}</TableHead>
                <TableHead className="text-right table-header-text">{t("dashboard.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {t("dashboard.no_orders")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell>
                      {t(`orders.order_type.${order.type}`)}
                      {order.editedFields?.includes("type") && (
                        <span className="block text-xs text-muted-foreground italic">({t("common.edited")})</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {" "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{order.description}</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{order.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {order.editedFields?.includes("description") && (
                        <span className="block text-xs text-muted-foreground italic">({t("common.edited")})</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status}>{t(`dashboard.${order.status}`)}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {order.status === "open" && (
                            <DropdownMenuItem onClick={() => handleCancelOrder(order.id)}>
                              {t("dashboard.action.cancel")}
                            </DropdownMenuItem>
                          )}
                          {order.status === "closed" && order.commentId && (
                            <DropdownMenuItem onClick={() => handleViewComments(order)}>
                              <MessageSquare className="mr-2 h-4 w-4" /> {t("dashboard.action.view_comments")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Comments Modal (for admin to see user review) */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.action.view_comments")}</DialogTitle>
            <DialogDescription>
              {t("reviews.table.order_id")}: {selectedOrderForComments?.id}
            </DialogDescription>
          </DialogHeader>
          {review ? (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">{t("reviews.table.user")}:</p>
                <p className="text-base">{reviewUser?.username || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("reviews.table.rating")}:</p>
                <p className="text-base">{review.rating} / 5</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("reviews.table.comment")}:</p>
                <p className="text-base italic">{review.comment}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">{t("common.no_data")}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
