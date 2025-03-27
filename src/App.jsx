import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Settings from './pages/Settings'
import ManageCourse from './pages/ManageCourse'
import ManageUsers from './pages/ManageUsers'
import Layout from './components/Layout'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Zen Academy...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      
      <Route element={<ProtectedRoute user={user} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Admin only routes */}
          <Route path="/manage-course" element={<AdminRoute user={user}><ManageCourse /></AdminRoute>} />
          <Route path="/manage-users" element={<AdminRoute user={user}><ManageUsers /></AdminRoute>} />
        </Route>
      </Route>
    </Routes>
  )
}

// Protected route component
function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" />
  }
  
  return children ? children : <Outlet />
}

// Admin route component
function AdminRoute({ user, children }) {
  if (user?.role !== 'admin') {
    return <Navigate to="/" />
  }
  
  return children
}

export default App