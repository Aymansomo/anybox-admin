"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const staffUser = localStorage.getItem("staffUser")
    if (staffUser) {
      try {
        const staff = JSON.parse(staffUser)
        router.push(staff.role === "manager" ? "/manager-dashboard" : "/staff-dashboard")
        return
      } catch {
        localStorage.removeItem("staffUser")
        localStorage.removeItem("staffToken")
      }
    }

    const isLoggedIn = localStorage.getItem("isLoggedIn")
    router.push(isLoggedIn ? "/dashboard" : "/login")
  }, [router])

  return null
}
