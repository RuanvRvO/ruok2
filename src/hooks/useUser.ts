'use client'

import { useState, useEffect } from 'react'

type User = {
  _id: string
  name: string
  email: string
  createdAt: number
} | null

export function useUser() {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check both localStorage and sessionStorage
    const userFromLocal = localStorage.getItem('user')
    const userFromSession = sessionStorage.getItem('user')
    
    const userData = userFromLocal || userFromSession
    
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        setUser(null)
      }
    }
    
    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return { user, isLoading, logout }
}
