import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface StaffUser {
  id: number
  username: string
  email: string
  full_name: string
  role: 'staff' | 'manager'
  is_active: boolean
  last_login: string | null
  join_date: string
  created_at: string
  updated_at: string
}

interface StaffAuthContextType {
  user: StaffUser | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined)

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('staffToken')
    const storedUser = localStorage.getItem('staffUser')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.staff)
        localStorage.setItem('staffToken', data.token)
        localStorage.setItem('staffUser', JSON.stringify(data.staff))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('staffToken')
    localStorage.removeItem('staffUser')
  }

  return (
    <StaffAuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </StaffAuthContext.Provider>
  )
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext)
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider')
  }
  return context
}
