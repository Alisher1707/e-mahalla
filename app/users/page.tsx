"use client"

import type React from "react"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useData, type User } from "@/components/data-context" // User type import qilindi
import { useLanguage } from "@/components/language-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Plus, Edit } from "lucide-react" // Edit icon qo'shildi
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function UsersListPage() {
  const { users, currentUser, isLoggedIn, editUser } = useData() // editUser qo'shildi
  const { t } = useLanguage()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null)
  const [editApartmentNumber, setEditApartmentNumber] = useState("")
  const [editRoomNumber, setEditRoomNumber] = useState("")
  const [editMembersCount, setEditMembersCount] = useState(1) // Yangi: A'zolar soni

  const userList = useMemo(() => {
    let filtered = users.filter((user) => user.role === "user")

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.apartment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.room?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    return filtered
  }, [users, searchTerm])

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

  const handleEditUserClick = (user: User) => {
    setSelectedUserToEdit(user)
    setEditApartmentNumber(user.apartment || "")
    setEditRoomNumber(user.room || "")
    setEditMembersCount(user.membersCount || 1) // Yangi: A'zolar sonini o'rnatish
    setShowEditUserModal(true)
  }

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUserToEdit) {
      editUser(selectedUserToEdit.id, editApartmentNumber, editRoomNumber, editMembersCount) // editMembersCount qo'shildi
      setShowEditUserModal(false)
      setSelectedUserToEdit(null)
      setEditApartmentNumber("")
      setEditRoomNumber("")
      setEditMembersCount(1) // Reset members count
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("sidebar.users_list")}</h1>
        <Button
          asChild
          className="bg-darkslategrey text-ivory border border-primary-foreground hover:bg-darkslategrey/90 font-semibold shadow-md"
        >
          <Link href="/create-user">
            <span>
              <Plus className="mr-2 h-4 w-4" /> {t("create_user.add_user")}
            </span>
          </Link>
        </Button>
      </div>

      <Input
        placeholder={t("users.search_placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="table-header-text">ID</TableHead>
              <TableHead className="table-header-text">{t("login.username")}</TableHead>
              <TableHead className="table-header-text">{t("create_user.apartment_number")}</TableHead>
              <TableHead className="table-header-text">{t("create_user.room_number")}</TableHead>
              <TableHead className="table-header-text">{t("create_user.members_count")}</TableHead>
              <TableHead className="text-right table-header-text">{t("dashboard.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t("common.no_data")}
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.apartment}</TableCell>
                  <TableCell>{user.room}</TableCell>
                  <TableCell>{user.membersCount || t("common.not_set")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEditUserClick(user)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t("dashboard.action.edit")}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Modal (Admin panelidan foydalanuvchini tahrirlash uchun) */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("users.edit_user_modal.title")}</DialogTitle>
            <DialogDescription>
              {t("users.edit_user_modal.description", { username: selectedUserToEdit?.username })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUserSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editApartmentNumber" className="text-right">
                {t("create_user.apartment_number")}
              </Label>
              <Input
                id="editApartmentNumber"
                type="text"
                value={editApartmentNumber}
                onChange={(e) => setEditApartmentNumber(e.target.value)}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editRoomNumber" className="text-right">
                {t("create_user.room_number")}
              </Label>
              <Input
                id="editRoomNumber"
                type="text"
                value={editRoomNumber}
                onChange={(e) => setEditRoomNumber(e.target.value)}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editMembersCount" className="text-right">
                {t("create_user.members_count")}
              </Label>
              <Input
                id="editMembersCount"
                type="number"
                value={editMembersCount}
                onChange={(e) => setEditMembersCount(Number(e.target.value))}
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
