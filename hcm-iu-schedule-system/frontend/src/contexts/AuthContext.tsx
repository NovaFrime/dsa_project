import { createContext, useContext, useState, ReactNode } from 'react'
import axios from 'axios'

interface AuthContextType {
  isAuthenticated: boolean
  login: (account: string, blackboardPassword: string, edusoftPassword: string) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = async (account: string, blackboardPassword: string, edusoftPassword: string) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth`, {
        username: account,
        Blackboard_password: blackboardPassword,
        Edusoft_password: edusoftPassword,
      })

      if (response.data.message == "Authentication successful") {
        setIsAuthenticated(true)
        localStorage.setItem('userCredentials', JSON.stringify({ account, blackboardPassword, edusoftPassword }))
      }

      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('userCredentials')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
