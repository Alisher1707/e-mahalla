"use client"

import type React from "react"
import { useLanguage } from "@/components/language-context"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MessageSquare, Edit } from "lucide-react"
import { useData, type Order, type OrderType } from "@/components/data-context"
import { StatusBadge } from "@/components/status-badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export default function OrdersPage() {
  const { currentUser, getUserOrders, closeOrder, addOrder, editOrder, getReviewById, isLoggedIn } = useData()
  const { t } = useLanguage()
  const router = useRouter()

  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [newOrderType, setNewOrderType] = useState<OrderType | "">("")
  const [newOrderDescription, setNewOrderDescription] = useState("")

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrderToReview, setSelectedOrderToReview] = useState<Order | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")

  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [selectedOrderForComments, setSelectedOrderForComments] = useState<Order | null>(null)

  // Yangi: Buyurtmani tahrirlash uchun state'lar
  const [showEditOrderModal, setShowEditOrderModal] = useState(false)
  const [selectedOrderToEdit, setSelectedOrderToEdit] = useState<Order | null>(null)
  const [editOrderType, setEditOrderType] = useState<OrderType | "">("")
  const [editOrderDescription, setEditOrderDescription] = useState("")

  const userOrders = useMemo(() => (currentUser ? getUserOrders(currentUser.id) : []), [currentUser, getUserOrders])

  // Protect route: only accessible by user role
  useEffect(() => {
    if (!isLoggedIn || currentUser?.role !== "user") {
      router.replace("/login") // Redirect to login if not user or not logged in
    }
  }, [isLoggedIn, currentUser, router])

  // Render nothing or a loading state if not authorized
  if (!isLoggedIn || currentUser?.role !== "user") {
    return null // Or a loading spinner/message
  }

  const handleNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser && newOrderType && newOrderDescription) {
      addOrder(currentUser.id, newOrderType as OrderType, newOrderDescription)
      setShowNewOrderModal(false)
      setNewOrderType("")
      setNewOrderDescription("")
    }
  }

  const handleCloseOrderClick = (order: Order) => {
    setSelectedOrderToReview(order)
    setShowReviewModal(true)
  }

  const handleReviewSubmit = () => {
    if (selectedOrderToReview && currentUser) {
      closeOrder(selectedOrderToReview.id, currentUser.id, reviewRating, reviewComment)
      setShowReviewModal(false)
      setSelectedOrderToReview(null)
      setReviewRating(5)
      setReviewComment("")
    }
  }

  const handleViewComments = (order: Order) => {
    setSelectedOrderForComments(order)
    setShowCommentsModal(true)
  }

  // Yangi: Buyurtmani tahrirlash modalini ochish
  const handleEditOrderClick = (order: Order) => {
    setSelectedOrderToEdit(order)
    setEditOrderType(order.type)
    setEditOrderDescription(order.description)
    setShowEditOrderModal(true)
  }

  // Yangi: Buyurtmani tahrirlashni saqlash
  const handleEditOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedOrderToEdit && editOrderType && editOrderDescription) {
      editOrder(selectedOrderToEdit.id, editOrderType, editOrderDescription)
      setShowEditOrderModal(false)
      setSelectedOrderToEdit(null)
      setEditOrderType("")
      setEditOrderDescription("")
    }
  }

  const review = selectedOrderForComments?.commentId ? getReviewById(selectedOrderForComments.commentId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
        <Button onClick={() => setShowNewOrderModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t("orders.new_order")}
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] table-header-text">{t("dashboard.table.id")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.type")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.description")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.date")}</TableHead>
                <TableHead className="table-header-text">{t("dashboard.table.status")}</TableHead>
                <TableHead className="text-right table-header-text">{t("dashboard.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t("dashboard.no_orders")}
                  </TableCell>
                </TableRow>
              ) : (
                userOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{t(`orders.order_type.${order.type}`)}</TableCell>
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
                    </TableCell>
                    <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status}>{t(`dashboard.${order.status}`)}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "open" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrderClick(order)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("dashboard.action.edit")}</span>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleCloseOrderClick(order)}>
                            {t("orders.table.close")}
                          </Button>
                        </>
                      )}
                      {order.status === "closed" && order.commentId && (
                        <Button variant="ghost" size="icon" onClick={() => handleViewComments(order)}>
                          <MessageSquare className="h-4 w-4" />
                          <span className="sr-only">{t("dashboard.action.view_comments")}</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* New Order Modal */}
      <Dialog open={showNewOrderModal} onOpenChange={setShowNewOrderModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("orders.new_order_form.title")}</DialogTitle>
            <DialogDescription>{t("orders.new_order_form.description")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewOrderSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orderType" className="text-right">
                {t("orders.new_order_form.type")}
              </Label>
              <Select onValueChange={(value) => setNewOrderType(value as OrderType)} value={newOrderType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("orders.new_order_form.select_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electrician">{t("orders.order_type.electrician")}</SelectItem>
                  <SelectItem value="plumber">{t("orders.order_type.plumber")}</SelectItem>
                  <SelectItem value="handyman">{t("orders.order_type.handyman")}</SelectItem>
                  <SelectItem value="carpenter">{t("orders.order_type.carpenter")}</SelectItem>
                  <SelectItem value="other">{t("orders.order_type.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t("orders.new_order_form.description")}
              </Label>
              <Textarea
                id="description"
                value={newOrderDescription}
                onChange={(e) => setNewOrderDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">{t("orders.new_order_form.submit")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("orders.review_modal.title")}</DialogTitle>
            <DialogDescription>
              {t("reviews.table.order_id")}: {selectedOrderToReview?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rating" className="text-right">
                {t("orders.review_modal.rating")}
              </Label>
              <Select onValueChange={(value) => setReviewRating(Number.parseInt(value))} value={String(reviewRating)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment" className="text-right">
                {t("orders.review_modal.comment")}
              </Label>
              <Textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="col-span-3"
                placeholder="Enter your comments here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              {t("orders.review_modal.cancel")}
            </Button>
            <Button onClick={handleReviewSubmit}>{t("orders.review_modal.submit")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Comments Modal (for user to see their own review) */}
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

      {/* Yangi: Edit Order Modal (Foydalanuvchi paneli uchun) */}
      <Dialog open={showEditOrderModal} onOpenChange={setShowEditOrderModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("dashboard.edit_order_modal.title")}</DialogTitle>
            <DialogDescription>
              {t("reviews.table.order_id")}: {selectedOrderToEdit?.id}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditOrderSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editOrderType" className="text-right">
                {t("orders.new_order_form.type")}
              </Label>
              <Select onValueChange={(value) => setEditOrderType(value as OrderType)} value={editOrderType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("orders.new_order_form.select_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electrician">{t("orders.order_type.electrician")}</SelectItem>
                  <SelectItem value="plumber">{t("orders.order_type.plumber")}</SelectItem>
                  <SelectItem value="handyman">{t("orders.order_type.handyman")}</SelectItem>
                  <SelectItem value="carpenter">{t("orders.order_type.carpenter")}</SelectItem>
                  <SelectItem value="other">{t("orders.order_type.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editOrderDescription" className="text-right">
                {t("orders.new_order_form.description")}
              </Label>
              <Textarea
                id="editOrderDescription"
                value={editOrderDescription}
                onChange={(e) => setEditOrderDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">{t("dashboard.edit_order_modal.submit")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
