import { useState, useEffect } from 'react'
import YouTube from 'react-youtube'
import { supabase } from '../lib/supabase'

function Learn() {
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch modules on component mount
  useEffect(() => {
    fetchModules()
  }, [])

  // Fetch chapters when a module is selected
  useEffect(() => {
    if (selectedModule) {
      fetchChapters(selectedModule.id)
    }
  }, [selectedModule])

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
      
      // Select the first module by default if available
      if (data.length > 0 && !selectedModule) {
        setSelectedModule(data[0])
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      setError('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }

  // Fetch chapters for a specific module
  const fetchChapters = async (moduleId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('module_id', moduleId)
        .eq('status', 'live') // Only show live chapters
        .order('title')
      
      if (error) throw error
      
      setChapters(data)
      
      // Select the first chapter by default if available
      if (data.length > 0) {
        setSelectedChapter(data[0])
      } else {
        setSelectedChapter(null)
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
      setError('Failed to load chapters')
    } finally {
      setLoading(false)
    }
  }

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    
    return (match && match[2].length === 11)
      ? match[2]
      : null
  }

  // Handle module selection
  const handleModuleChange = (e) => {
    const moduleId = e.target.value
    const module = modules.find(m => m.id.toString() === moduleId)
    setSelectedModule(module)
  }

  // Handle chapter selection
  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter)
  }

  return (
    <div className="h-full flex flex-col min-h-[calc(100vh-80px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Learn</h1>

        {/* Module selector */}
        <div className="mt-3">
          <label htmlFor="module-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Module
          </label>
          <select
            id="module-select"
            value={selectedModule?.id || ''}
            onChange={handleModuleChange}
            className="input"
            disabled={loading || modules.length === 0}
          >
            {modules.length === 0 && (
              <option value="">No modules available</option>
            )}

            {modules.map(module => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-6 h-full">
          {/* Video player */}
          <div className="md:w-2/3">
            {selectedChapter ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <YouTube
                    videoId={getYoutubeVideoId(selectedChapter.youtube_link)}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 0,
                      },
                    }}
                    className="absolute top-0 left-0 w-full h-full"
                    containerClassName="w-full h-full min-h-[400px]"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedChapter.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedModule?.title}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
                <p className="text-gray-500">
                  {chapters.length === 0
                    ? 'No chapters available for this module'
                    : 'Select a chapter to start learning'}
                </p>
              </div>
            )}
          </div>
          
          {/* Chapter list */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-medium text-gray-800 mb-3">Chapters</h3>
              
              {chapters.length === 0 ? (
                <p className="text-gray-500 text-sm">No chapters available</p>
              ) : (
                <ul className="space-y-2">
                  {chapters.map(chapter => (
                    <li key={chapter.id}>
                      <button
                        onClick={() => handleChapterSelect(chapter)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedChapter?.id === chapter.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {chapter.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Learn