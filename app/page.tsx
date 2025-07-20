"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/components/data-context"

export default function HomePage() {
  const { isLoggedIn, currentUser } = useData()
  const router = useRouter()

  useEffect(() => {
    console.log("HomePage useEffect: isLoggedIn", isLoggedIn, "currentUser", currentUser)
    if (isLoggedIn && currentUser) {
      if (currentUser.role === "admin") {
        console.log("Redirecting to /dashboard")
        router.replace("/dashboard")
      } else if (currentUser.role === "user") {
        console.log("Redirecting to /orders")
        router.replace("/orders")
      }
    } else {
      console.log("Redirecting to /login")
      router.replace("/login")
    }
  }, [isLoggedIn, currentUser, router])

  // Render nothing while redirecting to prevent flickering or incomplete UI
  return null
}
