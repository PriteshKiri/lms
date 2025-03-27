import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ManageCourse() {
  const [modules, setModules] = useState([])
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Module form state
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')
  const [editingModuleId, setEditingModuleId] = useState(null)
  
  // Chapter form state
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterYoutubeLink, setChapterYoutubeLink] = useState('')
  const [chapterStatus, setChapterStatus] = useState('draft')
  const [chapterModuleId, setChapterModuleId] = useState(null)
  const [editingChapterId, setEditingChapterId] = useState(null)

  // Fetch modules and chapters on component mount
  useEffect(() => {
    fetchModules()
    fetchChapters()
  }, [])

  // Fetch all modules
  const fetchModules = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('title')
      
      if (error) throw error
      
      setModules(data)
    } catch (error) {
      console.error('Error fetching modules:', error)
      setError('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all chapters
  const fetchChapters = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('title')
      
      if (error) throw error
      
      setChapters(data)
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setError('Failed to load chapters')
    } finally {
      setLoading(false)
    }
  }

  // Handle module form submission
  const handleModuleSubmit = async (e) => {
    e.preventDefault()
    
    if (!moduleTitle.trim()) {
      setMessage({ text: 'Module title is required', type: 'error' })
      return
    }
    
    try {
      setLoading(true)
      
      if (editingModuleId) {
        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update({ title: moduleTitle })
          .eq('id', editingModuleId)
        
        if (error) throw error
        
        setMessage({ text: 'Module updated successfully', type: 'success' })
      } else {
        // Create new module
        const { error } = await supabase
          .from('modules')
          .insert([{ title: moduleTitle }])
        
        if (error) throw error
        
        setMessage({ text: 'Module created successfully', type: 'success' })
      }
      
      // Reset form and refresh data
      setModuleTitle('')
      setEditingModuleId(null)
      setShowModuleModal(false)
      fetchModules()
    } catch (error) {
      console.error('Error saving module:', error)
      setMessage({ 
        text: error.message || 'Failed to save module', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle chapter form submission
  const handleChapterSubmit = async (e) => {
    e.preventDefault()
    
    if (!chapterTitle.trim() || !chapterYoutubeLink.trim() || !chapterModuleId) {
      setMessage({ text: 'All fields are required', type: 'error' })
      return
    }
    
    try {
      setLoading(true)
      
      if (editingChapterId) {
        // Update existing chapter
        const { error } = await supabase
          .from('chapters')
          .update({
            title: chapterTitle,
            youtube_link: chapterYoutubeLink,
            status: chapterStatus,
            module_id: chapterModuleId
          })
          .eq('id', editingChapterId)
        
        if (error) throw error
        
        setMessage({ text: 'Chapter updated successfully', type: 'success' })
      } else {
        // Create new chapter
        const { error } = await supabase
          .from('chapters')
          .insert([{
            title: chapterTitle,
            youtube_link: chapterYoutubeLink,
            status: chapterStatus,
            module_id: chapterModuleId
          }])
        
        if (error) throw error
        
        setMessage({ text: 'Chapter created successfully', type: 'success' })
      }
      
      // Reset form and refresh data
      resetChapterForm()
      setShowChapterModal(false)
      fetchChapters()
    } catch (error) {
      console.error('Error saving chapter:', error)
      setMessage({ 
        text: error.message || 'Failed to save chapter', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete a module
  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all associated chapters.')) {
      return
    }
    
    try {
      setLoading(true)
      
      // First delete all chapters in this module
      const { error: chaptersError } = await supabase
        .from('chapters')
        .delete()
        .eq('module_id', moduleId)
      
      if (chaptersError) throw chaptersError
      
      // Then delete the module
      const { error: moduleError } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId)
      
      if (moduleError) throw moduleError
      
      setMessage({ text: 'Module deleted successfully', type: 'success' })
      
      // Refresh data
      fetchModules()
      fetchChapters()
    } catch (error) {
      console.error('Error deleting module:', error)
      setMessage({ 
        text: error.message || 'Failed to delete module', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete a chapter
  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Are you sure you want to delete this chapter?')) {
      return
    }
    
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId)
      
      if (error) throw error
      
      setMessage({ text: 'Chapter deleted successfully', type: 'success' })
      
      // Refresh data
      fetchChapters()
    } catch (error) {
      console.error('Error deleting chapter:', error)
      setMessage({ 
        text: error.message || 'Failed to delete chapter', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Edit a module
  const handleEditModule = (module) => {
    setModuleTitle(module.title)
    setEditingModuleId(module.id)
    setShowModuleModal(true)
  }

  // Edit a chapter
  const handleEditChapter = (chapter) => {
    setChapterTitle(chapter.title)
    setChapterYoutubeLink(chapter.youtube_link)
    setChapterStatus(chapter.status)
    setChapterModuleId(chapter.module_id)
    setEditingChapterId(chapter.id)
    setShowChapterModal(true)
  }

  // Add a chapter to a specific module
  const handleAddChapter = (moduleId) => {
    resetChapterForm()
    setChapterModuleId(moduleId)
    setShowChapterModal(true)
  }

  // Reset chapter form
  const resetChapterForm = () => {
    setChapterTitle('')
    setChapterYoutubeLink('')
    setChapterStatus('draft')
    setChapterModuleId(null)
    setEditingChapterId(null)
  }

  // Get chapters for a specific module
  const getModuleChapters = (moduleId) => {
    return chapters.filter(chapter => chapter.module_id === moduleId)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Course</h1>
        <button
          onClick={() => {
            setModuleTitle('')
            setEditingModuleId(null)
            setShowModuleModal(true)
          }}
          className="btn btn-primary"
        >
          Add Module
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
      
      {loading && modules.length === 0 && chapters.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No modules added yet</p>
              <button
                onClick={() => {
                  setModuleTitle('')
                  setEditingModuleId(null)
                  setShowModuleModal(true)
                }}
                className="btn btn-primary mt-4"
              >
                Add Your First Module
              </button>
            </div>
          ) : (
            modules.map(module => (
              <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">{module.title}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditModule(module)}
                      className="p-2 text-gray-600 hover:text-primary"
                      title="Edit Module"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                      title="Delete Module"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-700">Chapters</h3>
                    <button
                      onClick={() => handleAddChapter(module.id)}
                      className="btn btn-secondary text-sm"
                    >
                      + Add Chapter
                    </button>
                  </div>
                  
                  {getModuleChapters(module.id).length === 0 ? (
                    <p className="text-gray-500 text-sm">No chapters added to this module</p>
                  ) : (
                    <ul className="divide-y">
                      {getModuleChapters(module.id).map(chapter => (
                        <li key={chapter.id} className="py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-800">{chapter.title}</h4>
                              <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                                {chapter.youtube_link}
                              </p>
                              <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                                chapter.status === 'live'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {chapter.status === 'live' ? 'Live' : 'Draft'}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditChapter(chapter)}
                                className="p-2 text-gray-600 hover:text-primary"
                                title="Edit Chapter"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteChapter(chapter.id)}
                                className="p-2 text-gray-600 hover:text-red-600"
                                title="Delete Chapter"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingModuleId ? 'Edit Module' : 'Add Module'}
              </h2>
            </div>
            
            <form onSubmit={handleModuleSubmit}>
              <div className="p-4">
                <div className="mb-4">
                  <label htmlFor="moduleTitle" className="block text-gray-700 font-medium mb-2">
                    Module Title
                  </label>
                  <input
                    id="moduleTitle"
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="input"
                    placeholder="Enter module title"
                    required
                  />
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
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
                  {loading ? 'Saving...' : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingChapterId ? 'Edit Chapter' : 'Add Chapter'}
              </h2>
            </div>
            
            <form onSubmit={handleChapterSubmit}>
              <div className="p-4">
                <div className="mb-4">
                  <label htmlFor="chapterTitle" className="block text-gray-700 font-medium mb-2">
                    Chapter Title
                  </label>
                  <input
                    id="chapterTitle"
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="input"
                    placeholder="Enter chapter title"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="chapterYoutubeLink" className="block text-gray-700 font-medium mb-2">
                    YouTube Link
                  </label>
                  <input
                    id="chapterYoutubeLink"
                    type="url"
                    value={chapterYoutubeLink}
                    onChange={(e) => setChapterYoutubeLink(e.target.value)}
                    className="input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="chapterStatus" className="block text-gray-700 font-medium mb-2">
                    Status
                  </label>
                  <select
                    id="chapterStatus"
                    value={chapterStatus}
                    onChange={(e) => setChapterStatus(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="live">Live</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="chapterModuleId" className="block text-gray-700 font-medium mb-2">
                    Module
                  </label>
                  <select
                    id="chapterModuleId"
                    value={chapterModuleId || ''}
                    onChange={(e) => setChapterModuleId(e.target.value)}
                    className="input"
                    required
                    disabled={editingChapterId === null && chapterModuleId !== null}
                  >
                    <option value="">Select a module</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
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
                  {loading ? 'Saving...' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageCourse