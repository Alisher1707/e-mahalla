"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useData } from "@/components/data-context"
import { useLanguage } from "@/components/language-provider"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export default function Login() {
  const { login, isLoggedIn, currentUser } = useData()
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      if (currentUser.role === "admin") {
        router.replace("/dashboard")
      } else if (currentUser.role === "user") {
        router.replace("/orders")
      }
    }
  }, [isLoggedIn, currentUser, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login(username, password)
  }

  const handleLanguageToggle = () => {
    setLanguage(language === "uz" ? "ru" : "uz")
  }

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div style={{ marginTop: '40px', marginLeft: '-20px' }}>
        <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
          <CardDescription>{t("login.test_credentials")}</CardDescription>
          <CardDescription>{t("login.admin_creds")}</CardDescription>
          <CardDescription>{t("login.user_creds")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("login.username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin or 21_169"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin123 or password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("login.button")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-1 p-4">
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
        </CardFooter>
        </Card>
      </div>
    </div>
  )
}