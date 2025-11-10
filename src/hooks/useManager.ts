'use client'

import { useEffect, useState } from "react"
import type { Id } from "../../convex/_generated/dataModel"

interface Manager {
  _id: Id<"managers">
  name: string
  email: string
  createdAt: number
}

export function useManager() {
  const [manager, setManager] = useState<Manager | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load manager from localStorage
    const storedManager = localStorage.getItem('manager')
    if (storedManager) {
      try {
        const parsed = JSON.parse(storedManager) as Manager
        setManager(parsed)
      } catch (e) {
        console.error('Failed to parse manager data:', e)
        localStorage.removeItem('manager')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (managerData: Manager) => {
    setManager(managerData)
    localStorage.setItem('manager', JSON.stringify(managerData))
  }

  const logout = () => {
    setManager(null)
    localStorage.removeItem('manager')
  }

  return {
    manager,
    isLoading,
    login,
    logout,
  }
}
