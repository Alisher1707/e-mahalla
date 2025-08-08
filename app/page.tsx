"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/components/data-context"

export default function HomePage() {
  const { isLoggedIn, currentUser } = useData()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      if (currentUser.role === "admin") {
        router.replace("/dashboard")
      } else if (currentUser.role === "user") {
        router.replace("/orders")
      }
    } else {
      router.replace("/login")
    }
  }, [isLoggedIn, currentUser, router])

  // Render nothing while redirecting to prevent flickering or incomplete UI
  return null
}
