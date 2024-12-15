import { NavLink } from 'react-router-dom'
import { Home, Settings, User, Sheet, Mail } from 'lucide-react'

const Sidebar = () => {
  return (
    <aside className="bg-card text-card-foreground w-64 flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 p-4">
          <li>
            <NavLink
              to="/utils"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded ${
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Home size={20} />
              <span>Courses Fetcher</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/gcsExams"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded ${
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Sheet size={20} />
              <span>Google Calendar Exams</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/gcsTimetables"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded ${
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Mail size={20} />
              <span>Google Calendar Timetables</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/timetable"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded ${
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <User size={20} />
              <span>New Timetable</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded ${
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

