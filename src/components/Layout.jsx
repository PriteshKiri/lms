import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Layout component that serves as the main structure for the application.
 * It includes a sidebar with navigation links, a top header with a logout button,
 * and a main content area where nested routes are rendered.
 *
 * The component uses the `useAuth` hook to get the current user, logout function,
 * and loading state. If no user is authenticated, it redirects to the login page.
 *
 * @returns {JSX.Element} The rendered layout component.
 */
function Layout() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const { error } = await logout()
      if (error) {
        console.error('Logout error:', error)
      }
      navigate('/login')
    } catch (error) {
      console.error('Logout exception:', error)
    }
  }

  // Safety check - if no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="flex h-screen bg-secondary">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Zen Academy</h2>
          <p className="text-sm text-gray-600 mt-1">Hello, {user?.name || 'User'}</p>
        </div>
        
        <nav className="mt-6 px-2">
          <NavLink to="/learn" className={({ isActive }) => 
            `sidebar-link mb-2 ${isActive ? 'active' : ''}`
          }>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .527-.226 1.028-.631 1.378l-.356.349a1.97 1.97 0 001.09 3.473c.66 0 1.303-.271 1.756-.773l.004-.005A4.99 4.99 0 0112 15v-2.99l.01-.01 4.39-1.882a1 1 0 000-1.84l-7-3z" />
            </svg>
            Learn
          </NavLink>
          
          {/* Admin only links */}
          {user?.role === 'admin' && (
            <>
              <NavLink to="/manage-course" className={({ isActive }) => 
                `sidebar-link mb-2 ${isActive ? 'active' : ''}`
              }>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Manage Course
              </NavLink>
              
              <NavLink to="/manage-users" className={({ isActive }) => 
                `sidebar-link mb-2 ${isActive ? 'active' : ''}`
              }>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Manage Users
              </NavLink>
            </>
          )}
          
          <NavLink to="/settings" className={({ isActive }) => 
            `sidebar-link mb-2 ${isActive ? 'active' : ''}`
          }>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </NavLink>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-end items-center p-4">
            <button 
              onClick={handleLogout}
              className="btn btn-secondary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 11.586V7z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-secondary">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout