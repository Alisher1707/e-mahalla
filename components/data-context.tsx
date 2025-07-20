"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "./language-provider"

// Define types for your data
export type UserRole = "admin" | "user"

export interface User {
  id: string
  username: string
  password: string // Password is not stored for security, but used for initial login
  role: UserRole
  apartment?: string
  room?: string
  membersCount?: number // Yangi: Xonadondagi a'zolar soni
}

export type OrderStatus = "open" | "closed" | "canceled"
export type OrderType = "electrician" | "plumber" | "handyman" | "carpenter" | "other"

export interface Order {
  id: string
  userId: string
  type: OrderType
  description: string
  date: string // ISO string
  status: OrderStatus
  commentId?: string // Link to a review
  lastEditedAt?: string // Yangi: Oxirgi tahrirlash vaqti
  editedFields?: ("type" | "description")[] // Yangi: Tahrirlangan maydonlar
}

export interface Review {
  id: string
  orderId: string
  userId: string
  rating: number // 1-5
  comment: string
  date: string // ISO string
}

interface DataContextType {
  users: User[]
  orders: Order[]
  reviews: Review[]
  currentUser: User | null
  isLoggedIn: boolean
  login: (username: string, password: string) => User | null // Changed return type
  logout: () => void
  addUser: (apartment: string, room: string, password: string, membersCount: number) => boolean // membersCount qo'shildi
  addOrder: (userId: string, type: OrderType, description: string) => boolean
  closeOrder: (orderId: string, userId: string, rating: number, comment: string) => boolean
  cancelOrder: (orderId: string) => boolean
  editOrder: (orderId: string, newType: OrderType, newDescription: string) => boolean
  editUser: (userId: string, newApartment: string, newRoom: string, newMembersCount: number) => boolean // newMembersCount qo'shildi
  getUserOrders: (userId: string) => Order[]
  getOrderById: (orderId: string) => Order | undefined
  getReviewById: (reviewId: string) => Review | undefined
  getUserById: (userId: string) => User | undefined
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast()
  const { t } = useLanguage()

  const [users, setUsers] = useState<User[]>([
    { id: "admin", username: "admin", password: "admin123", role: "admin" },
    {
      id: "user-21_169",
      username: "21_169",
      password: "password123",
      role: "user",
      apartment: "21",
      room: "169",
      membersCount: 3,
    },
  ])
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD001",
      userId: "user-21_169",
      type: "electrician",
      description: "Light not working in living room.",
      date: new Date().toISOString(),
      status: "open",
    },
    {
      id: "ORD002",
      userId: "user-21_169",
      type: "plumber",
      description: "Leaky faucet in kitchen.",
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: "closed",
    },
    {
      id: "ORD003",
      userId: "admin", // Example admin order, though typically users create them
      type: "other",
      description: "General maintenance request.",
      date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
      status: "canceled",
    },
    {
      id: "ORD004",
      userId: "user-21_169",
      type: "handyman",
      description: "Door handle broken.",
      date: new Date().toISOString(),
      status: "open",
    },
  ])
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "REV001",
      orderId: "ORD002",
      userId: "user-21_169",
      rating: 5,
      comment: "Excellent service, plumber was very quick and efficient!",
      date: new Date(Date.now() - 86400000 + 3600000).toISOString(), // 1 hour after order closed
    },
  ])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Re-enabled useEffect for localStorage persistence
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
    }
  }, [])

  const login = (username: string, password: string): User | null => {
    const user = users.find((u) => u.username === username && u.password === password)
    if (user) {
      setCurrentUser(user)
      setIsLoggedIn(true)
      localStorage.setItem("currentUser", JSON.stringify(user)) // Still store for potential future use or other components
      toast({
        title: t("common.success"),
        description: `Welcome, ${user.username}!`,
      })
      return user
    }
    toast({
      title: t("common.error"),
      description: t("login.invalid_credentials"),
      variant: "destructive",
    })
    return null
  }

  const logout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("currentUser") // Only place localStorage is cleared
    toast({
      title: t("common.success"),
      description: t("sidebar.logout"),
    })
  }

  const addUser = (apartment: string, room: string, password: string, membersCount: number): boolean => {
    const username = `${apartment}_${room}`
    if (users.some((u) => u.username === username)) {
      toast({
        title: t("common.error"),
        description: "User with this apartment and room already exists.",
        variant: "destructive",
      })
      return false
    }
    const newUser: User = {
      id: `user-${username}`,
      username,
      password, // Use the provided password
      role: "user",
      apartment,
      room,
      membersCount, // Yangi maydonni qo'shish
    }
    setUsers((prev) => [...prev, newUser])
    toast({
      title: t("common.success"),
      description: t("create_user.user_added_success"),
    })
    return true
  }

  const addOrder = (userId: string, type: OrderType, description: string): boolean => {
    const newOrderId = `ORD${String(orders.length + 1).padStart(3, "0")}`
    const newOrder: Order = {
      id: newOrderId,
      userId,
      type,
      description,
      date: new Date().toISOString(),
      status: "open",
    }
    setOrders((prev) => [...prev, newOrder])
    toast({
      title: t("common.success"),
      description: "Buyurtma muvaffaqiyatli yaratildi!", // Hardcoded for now, add to translations
    })
    return true
  }

  const closeOrder = (orderId: string, userId: string, rating: number, comment: string): boolean => {
    const orderIndex = orders.findIndex((o) => o.id === orderId && o.status === "open")
    if (orderIndex === -1) {
      toast({
        title: t("common.error"),
        description: "Order not found or not open.",
        variant: "destructive",
      })
      return false
    }

    const newReviewId = `REV${String(reviews.length + 1).padStart(3, "0")}`
    const newReview: Review = {
      id: newReviewId,
      orderId,
      userId,
      rating,
      comment,
      date: new Date().toISOString(),
    }

    setReviews((prev) => [...prev, newReview])

    const updatedOrders = [...orders]
    updatedOrders[orderIndex] = {
      ...updatedOrders[orderIndex],
      status: "closed",
      commentId: newReviewId,
    }
    setOrders(updatedOrders)
    toast({
      title: t("common.success"),
      description: t("orders.order_closed_success"),
    })
    toast({
      title: t("common.success"),
      description: t("orders.review_submitted_success"),
    })
    return true
  }

  const cancelOrder = (orderId: string): boolean => {
    const orderIndex = orders.findIndex((o) => o.id === orderId && o.status === "open")
    if (orderIndex === -1) {
      toast({
        title: t("common.error"),
        description: "Order not found or not open.",
        variant: "destructive",
      })
      return false
    }
    const updatedOrders = [...orders]
    updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], status: "canceled" }
    setOrders(updatedOrders)
    toast({
      title: t("common.success"),
      description: t("dashboard.order_canceled_success"),
    })
    return true
  }

  // Buyurtmani tahrirlash funksiyasi
  const editOrder = (orderId: string, newType: OrderType, newDescription: string): boolean => {
    const orderIndex = orders.findIndex((o) => o.id === orderId)
    if (orderIndex === -1) {
      toast({ title: t("common.error"), description: "Order not found.", variant: "destructive" })
      return false
    }

    const existingOrder = orders[orderIndex]
    const updatedFields: ("type" | "description")[] = []

    if (existingOrder.type !== newType) {
      updatedFields.push("type")
    }
    if (existingOrder.description !== newDescription) {
      updatedFields.push("description")
    }

    if (updatedFields.length === 0) {
      toast({ title: t("common.info"), description: "No changes detected.", variant: "default" })
      return false // No actual changes made
    }

    const updatedOrders = [...orders]
    updatedOrders[orderIndex] = {
      ...existingOrder, // Mavjud buyurtma ma'lumotlarini saqlab qolish
      type: newType,
      description: newDescription,
      lastEditedAt: new Date().toISOString(), // Tahrirlash vaqtini yangilash
      editedFields: updatedFields, // Tahrirlangan maydonlarni belgilash
    }
    setOrders(updatedOrders)
    toast({ title: t("common.success"), description: t("orders.order_updated_success") })
    return true
  }

  // Yangi: Foydalanuvchi ma'lumotlarini tahrirlash funksiyasi
  const editUser = (userId: string, newApartment: string, newRoom: string, newMembersCount: number): boolean => {
    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      toast({ title: t("common.error"), description: "User not found.", variant: "destructive" })
      return false
    }

    const existingUser = users[userIndex]
    const newUsername = `${newApartment}_${newRoom}`

    // Check if the new username already exists for another user
    if (users.some((u) => u.id !== userId && u.username === newUsername)) {
      toast({ title: t("common.error"), description: t("users.username_exists"), variant: "destructive" })
      return false
    }

    if (
      existingUser.apartment === newApartment &&
      existingUser.room === newRoom &&
      existingUser.membersCount === newMembersCount
    ) {
      toast({ title: t("common.info"), description: t("common.no_changes_detected"), variant: "default" })
      return false
    }

    const updatedUsers = [...users]
    updatedUsers[userIndex] = {
      ...existingUser,
      apartment: newApartment,
      room: newRoom,
      username: newUsername, // Update username based on new apartment/room
      membersCount: newMembersCount, // Yangi maydonni yangilash
    }
    setUsers(updatedUsers)

    // If the current logged-in user is being edited, update currentUser state as well
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUsers[userIndex])
      localStorage.setItem("currentUser", JSON.stringify(updatedUsers[userIndex]))
    }

    toast({ title: t("common.success"), description: t("users.user_updated_success") })
    return true
  }

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter((order) => order.userId === userId)
  }

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((order) => order.id === orderId)
  }

  const getReviewById = (reviewId: string): Review | undefined => {
    return reviews.find((review) => review.id === reviewId)
  }

  const getUserById = (userId: string): User | undefined => {
    return users.find((user) => user.id === userId)
  }

  const value = {
    users,
    orders,
    reviews,
    currentUser,
    isLoggedIn,
    login,
    logout,
    addUser,
    addOrder,
    closeOrder,
    cancelOrder,
    editOrder,
    editUser, // Yangi funksiyani qo'shish
    getUserOrders,
    getOrderById,
    getReviewById,
    getUserById,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
