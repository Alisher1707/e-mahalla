"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/components/data-context"
import { useLanguage } from "@/components/language-provider"

export default function CreateUserPage() {
  const { addUser } = useData()
  const { t } = useLanguage()
  const [apartmentNumber, setApartmentNumber] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [password, setPassword] = useState("")
  const [membersCount, setMembersCount] = useState(1) // Yangi: A'zolar soni

  const generatedLogin = useMemo(() => {
    if (apartmentNumber && roomNumber) {
      return `${apartmentNumber}_${roomNumber}`
    }
    return ""
  }, [apartmentNumber, roomNumber])

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (apartmentNumber && roomNumber && password) {
      addUser(apartmentNumber, roomNumber, password, membersCount) // membersCount qo'shildi
      setApartmentNumber("")
      setRoomNumber("")
      setPassword("") // Clear password field
      setMembersCount(1) // Reset members count
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("create_user.title")}</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("create_user.title")}</CardTitle>
          <CardDescription>
            {t("create_user.apartment_number")} va {t("create_user.room_number")} kiriting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apartment-number">{t("create_user.apartment_number")}</Label>
              <Input
                id="apartment-number"
                type="text"
                placeholder="e.g., 21"
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-number">{t("create_user.room_number")}</Label>
              <Input
                id="room-number"
                type="text"
                placeholder="e.g., 169"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="members-count">{t("create_user.members_count")}</Label> {/* Yangi input */}
              <Input
                id="members-count"
                type="number"
                placeholder="e.g., 3"
                value={membersCount}
                onChange={(e) => setMembersCount(Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("create_user.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password for new user"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {generatedLogin && (
              <div className="space-y-2">
                <Label>{t("create_user.generated_login")}</Label>
                <Input value={generatedLogin} readOnly className="font-mono" />
              </div>
            )}
            <Button type="submit" className="w-full">
              {t("create_user.add_user")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
