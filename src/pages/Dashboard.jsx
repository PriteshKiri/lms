import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to Learn page as Dashboard is just a landing page
    navigate('/learn')
  }, [navigate])
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Zen Academy</h1>
        <p className="text-gray-600 mb-8">Redirecting to learning dashboard...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}

export default Dashboard