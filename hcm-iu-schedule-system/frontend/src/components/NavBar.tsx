import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

const Navbar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl px-4 sm:pl-6 lg:pl-8">
        <div className="flex justify-between h-16">
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <SunIcon className="h-[1.2rem] w-[1.2rem]" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

