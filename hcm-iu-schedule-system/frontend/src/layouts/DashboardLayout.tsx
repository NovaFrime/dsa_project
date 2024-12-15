import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/SideBar'
import Navbar from '@/components/NavBar'

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex  flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 pt-20">
          <Outlet />
        </main>
        <Navbar />
      </div>
    </div>
  )
}

export default DashboardLayout

