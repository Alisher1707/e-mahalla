"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useData } from "@/components/data-context"
import { useLanguage } from "@/components/language-provider"

export default function ReviewsPage() {
  const { reviews, getUserById, currentUser, isLoggedIn } = useData()
  const { t } = useLanguage()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")

  const filteredReviews = useMemo(() => {
    let filtered = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (searchTerm) {
      filtered = filtered.filter((review) => {
        const user = getUserById(review.userId)
        return (
          review.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.username.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }
    return filtered
  }, [reviews, searchTerm, getUserById])

  // Protect route: only accessible by admin
  useEffect(() => {
    if (!isLoggedIn || currentUser?.role !== "admin") {
      router.replace("/login") // Redirect to login if not admin or not logged in
    }
  }, [isLoggedIn, currentUser, router])

  // Render nothing or a loading state if not authorized
  if (!isLoggedIn || currentUser?.role !== "admin") {
    return null // Or a loading spinner/message
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("reviews.title")}</h1>

      <Input
        placeholder={t("reviews.search_placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("reviews.table.order_id")}</TableHead>
              <TableHead>{t("reviews.table.user")}</TableHead>
              <TableHead>{t("reviews.table.rating")}</TableHead>
              <TableHead>{t("reviews.table.comment")}</TableHead>
              <TableHead>{t("dashboard.table.date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t("reviews.no_reviews")}
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => {
                const user = getUserById(review.userId)
                return (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.orderId}</TableCell>
                    <TableCell>{user?.username || "N/A"}</TableCell>
                    <TableCell>{review.rating} / 5</TableCell>
                    <TableCell className="max-w-[300px]">{review.comment}</TableCell>
                    <TableCell>{new Date(review.date).toLocaleString()}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
