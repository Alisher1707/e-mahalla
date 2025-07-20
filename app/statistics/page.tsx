"use client"

import { useMemo, useEffect } from "react" // Ensure useEffect is imported
import { useRouter } from "next/navigation" // Ensure useRouter is imported
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useData } from "@/components/data-context"
import { useLanguage } from "@/components/language-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StatisticsPage() {
  const { orders, users, currentUser, isLoggedIn } = useData() // Added currentUser, isLoggedIn
  const { t } = useLanguage()
  const router = useRouter() // Added useRouter

  const totalOrders = orders.length
  const openOrders = orders.filter((order) => order.status === "open").length
  const closedOrders = orders.filter((order) => order.status === "closed").length
  const canceledOrders = orders.filter((order) => order.status === "canceled").length

  const mostActiveUsers = useMemo(() => {
    const userOrderCounts: { [key: string]: number } = {}
    orders.forEach((order) => {
      userOrderCounts[order.userId] = (userOrderCounts[order.userId] || 0) + 1
    })

    const sortedUsers = Object.entries(userOrderCounts)
      .map(([userId, count]) => {
        const user = users.find((u) => u.id === userId)
        return { username: user?.username || userId, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 most active

    return sortedUsers
  }, [orders, users])

  // Protect route: only accessible by admin role
  useEffect(() => {
    if (!isLoggedIn || currentUser?.role !== "admin") {
      // Corrected condition: should be admin
      router.replace("/login") // Redirect to login if not admin or not logged in
    }
  }, [isLoggedIn, currentUser, router])

  // Render nothing or a loading state if not authorized
  if (!isLoggedIn || currentUser?.role !== "admin") {
    // Corrected condition: should be admin
    return null // Or a loading spinner/message
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("statistics.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statistics.total_orders")}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statistics.active_orders")}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 10H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statistics.closed_orders")}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="6" rx="2" />
              <path d="M22 10H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statistics.canceled_orders")}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{canceledOrders}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-8">{t("dashboard.filter_status")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.filter_status")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("dashboard.open")}</span>
              <span className="text-sm font-medium">
                {openOrders} ({((openOrders / totalOrders) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-yellow-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(openOrders / totalOrders) * 100 || 0}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("dashboard.closed")}</span>
              <span className="text-sm font-medium">
                {closedOrders} ({((closedOrders / totalOrders) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(closedOrders / totalOrders) * 100 || 0}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("dashboard.canceled")}</span>
              <span className="text-sm font-medium">
                {canceledOrders} ({((canceledOrders / totalOrders) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-red-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(canceledOrders / totalOrders) * 100 || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          {t("statistics.total_orders")}: {totalOrders}
        </CardFooter>
      </Card>

      <h2 className="text-2xl font-bold mt-8">{t("statistics.most_active_users")}</h2>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{t("dashboard.table.user")}</TableHead>
              <TableHead className="text-right">{t("statistics.total_orders")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mostActiveUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  {t("common.no_data")}
                </TableCell>
              </TableRow>
            ) : (
              mostActiveUsers.map((user, index) => (
                <TableRow key={user.username}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="text-right">{user.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
