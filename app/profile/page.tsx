"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/components/data-context"
import { useLanguage } from "@/components/language-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function UserProfilePage() {
  const { currentUser, isLoggedIn, editUser } = useData()
  const { t } = useLanguage()
  const router = useRouter()

  const [showEditModal, setShowEditModal] = useState(false)
  const [apartmentNumber, setApartmentNumber] = useState(currentUser?.apartment || "")
  const [roomNumber, setRoomNumber] = useState(currentUser?.room || "")
  const [membersCount, setMembersCount] = useState(currentUser?.membersCount || 1) // Yangi: A'zolar soni

  useEffect(() => {
    if (!isLoggedIn || !currentUser || currentUser.role !== "user") {
      router.replace("/login")
    } else {
      setApartmentNumber(currentUser.apartment || "")
      setRoomNumber(currentUser.room || "")
      setMembersCount(currentUser.membersCount || 1) // Yangi: A'zolar sonini o'rnatish
    }
  }, [isLoggedIn, currentUser, router])

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser) {
      editUser(currentUser.id, apartmentNumber, roomNumber, membersCount) // membersCount qo'shildi
      setShowEditModal(false)
    }
  }

  if (!isLoggedIn || !currentUser || currentUser.role !== "user") {
    return null // Or a loading spinner/message
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("profile.title")}</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("profile.your_profile")}</CardTitle>
          <CardDescription>{t("profile.view_and_edit_details")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("login.username")}</Label>
            <Input value={currentUser.username} readOnly className="font-mono" />
          </div>
          <div>
            <Label>{t("create_user.apartment_number")}</Label>
            <Input value={currentUser.apartment || t("common.not_set")} readOnly />
          </div>
          <div>
            <Label>{t("create_user.room_number")}</Label>
            <Input value={currentUser.room || t("common.not_set")} readOnly />
          </div>
          <div>
            <Label>{t("create_user.members_count")}</Label> {/* Yangi: A'zolar sonini ko'rsatish */}
            <Input value={currentUser.membersCount?.toString() || t("common.not_set")} readOnly />
          </div>
          <Button onClick={() => setShowEditModal(true)} className="w-full">
            {t("profile.edit_profile")}
          </Button>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("profile.edit_profile")}</DialogTitle>
            <DialogDescription>{t("profile.update_apartment_room")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apartment-number" className="text-right">
                {t("create_user.apartment_number")}
              </Label>
              <Input
                id="apartment-number"
                type="text"
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room-number" className="text-right">
                {t("create_user.room_number")}
              </Label>
              <Input
                id="room-number"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="members-count" className="text-right">
                {t("create_user.members_count")}
              </Label>
              <Input
                id="members-count"
                type="number"
                value={membersCount}
                onChange={(e) => setMembersCount(Number(e.target.value))}
                min="1"
                required
                className="col-span-3"
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
