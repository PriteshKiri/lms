import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // User form state
  const [showUserModal, setShowUserModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [editingUserId, setEditingUserId] = useState(null)

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // Handle user form submission
  const handleUserSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim()) {
      setMessage({ text: 'Name and email are required', type: 'error' })
      return
    }
    
    if (!editingUserId && !password.trim()) {
      setMessage({ text: 'Password is required for new users', type: 'error' })
      return
    }
    
    try {
      setLoading(true)
      
      if (editingUserId) {
        // Update existing user
        const updates = { name, role }
        
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', editingUserId)
        
        if (error) throw error
        
        // If email is changed, update auth
        const user = users.find(u => u.id === editingUserId)
        if (user.email !== email) {
          // This would typically require admin privileges in Supabase
          // For this example, we'll assume it works
          const { error: authError } = await supabase.auth.admin.updateUserById(
            editingUserId,
            { email }
          )
          
          if (authError) throw authError
        }
        
        // If password is provided, update it
        if (password.trim()) {
          // This would typically require admin privileges in Supabase
          // For this example, we'll assume it works
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            editingUserId,
            { password }
          )
          
          if (passwordError) throw passwordError
        }
        
        setMessage({ text: 'User updated successfully', type: 'success' })
      } else {
        // Create new user
        // In a real app, you would use Supabase admin functions or a server endpoint
        // For this example, we'll simulate the creation
        
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (authError) throw authError
        
        // 2. Add user profile data
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            name,
            email,
            role
          }])
        
        if (profileError) throw profileError
        
        setMessage({ text: 'User created successfully', type: 'success' })
      }
      
      // Reset form and refresh data
      resetUserForm()
      setShowUserModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      setMessage({ 
        text: error.message || 'Failed to save user', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete a user
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }
    
    try {
      setLoading(true)
      
      // In a real app, you would use Supabase admin functions or a server endpoint
      // For this example, we'll simulate the deletion
      
      // 1. Delete user profile data
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      
      if (profileError) throw profileError
      
      // 2. Delete auth user
      // This would typically require admin privileges in Supabase
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) throw authError
      
      setMessage({ text: 'User deleted successfully', type: 'success' })
      
      // Refresh data
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage({ 
        text: error.message || 'Failed to delete user', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Edit a user
  const handleEditUser = (user) => {
    setName(user.name)
    setEmail(user.email)
    setPassword('')
    setRole(user.role)
    setEditingUserId(user.id)
    setShowUserModal(true)
  }

  // Reset user form
  const resetUserForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('user')
    setEditingUserId(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <button
          onClick={() => {
            resetUserForm()
            setShowUserModal(true)
          }}
          className="btn btn-primary"
        >
          Add User
        </button>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-3 rounded-md ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {users.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No users found</p>
              <button
                onClick={() => {
                  resetUserForm()
                  setShowUserModal(true)
                }}
                className="btn btn-primary mt-4"
              >
                Add Your First User
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-orange-600 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingUserId ? 'Edit User' : 'Add User'}
              </h2>
            </div>
            
            <form onSubmit={handleUserSubmit}>
              <div className="p-4">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Enter user name"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="Enter user email"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder={editingUserId ? "Leave blank to keep current password" : "Enter password"}
                    required={!editingUserId}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageUsers