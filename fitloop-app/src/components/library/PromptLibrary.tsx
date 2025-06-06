import React, { useState, useEffect } from 'react'
import { Plus, Search, Star, Copy, Trash2, Check } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { StorageManager } from '../../lib/db'
import { useClipboard } from '../../hooks/useClipboard'
import type { SavedPrompt } from '../../models/promptCollection'

const storage = new StorageManager()

export const PromptLibrary: React.FC = () => {
  const { darkMode } = useTheme()
  const clipboard = useClipboard()
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<SavedPrompt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const filters = [
    { id: 'all', label: '全て' },
    { id: 'upper', label: '上半身' },
    { id: 'lower', label: '下半身' },
    { id: 'full', label: '全身' },
    { id: 'favorite', label: 'お気に入り', icon: Star }
  ]

  useEffect(() => {
    loadPrompts()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [searchQuery, selectedFilter, prompts])

  const loadPrompts = async () => {
    setLoading(true)
    try {
      const savedPrompts = await storage.getSavedPrompts()
      setPrompts(savedPrompts)
    } catch (error) {
      console.error('Failed to load prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPrompts = () => {
    let filtered = prompts

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'favorite') {
        filtered = filtered.filter(prompt => prompt.isFavorite)
      } else {
        filtered = filtered.filter(prompt => {
          const tags = prompt.tags || []
          return tags.some(tag => tag.toLowerCase().includes(selectedFilter))
        })
      }
    }

    setFilteredPrompts(filtered)
  }

  const handleCopyPrompt = async (prompt: SavedPrompt) => {
    try {
      await clipboard.copy(prompt.content)
      setCopiedPromptId(prompt.id?.toString() || '')
      setTimeout(() => setCopiedPromptId(null), 2000)
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  const handleToggleFavorite = async (prompt: SavedPrompt) => {
    try {
      const updatedPrompt = { ...prompt, isFavorite: !prompt.isFavorite }
      await storage.updateSavedPrompt(updatedPrompt)
      loadPrompts()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (window.confirm('このメニューを削除しますか？')) {
      try {
        await storage.deleteSavedPrompt(promptId)
        loadPrompts()
      } catch (error) {
        console.error('Failed to delete prompt:', error)
      }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'upper':
      case '上半身':
        return darkMode ? 'bg-blue-700 text-blue-300' : 'bg-blue-100 text-blue-700'
      case 'lower':
      case '下半身':
        return darkMode ? 'bg-green-700 text-green-300' : 'bg-green-100 text-green-700'
      case 'full':
      case '全身':
        return darkMode ? 'bg-purple-700 text-purple-300' : 'bg-purple-100 text-purple-700'
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
    }
  }

  const getPromptCategory = (prompt: SavedPrompt): string => {
    const tags = prompt.tags || []
    if (tags.some(tag => tag.includes('上半身'))) return '上半身'
    if (tags.some(tag => tag.includes('下半身'))) return '下半身'
    if (tags.some(tag => tag.includes('全身'))) return '全身'
    return prompt.category || 'その他'
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-primary' : 'bg-background-primary'} p-4`}>
      {/* Create New Menu Button */}
      <button className="w-full h-12 bg-gradient-primary text-white rounded-lg shadow-md hover:scale-102 hover:shadow-lg transition-all duration-200 mb-4 flex items-center justify-center gap-2 font-medium">
        <Plus size={20} />
        新規メニュー作成
      </button>

      {/* Search Bar */}
      <div className={`${darkMode ? 'bg-dark-secondary' : 'bg-white'} rounded-xl shadow-sm p-3 mb-4 flex items-center gap-3`}>
        <Search size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="メニューを検索..."
          className={`flex-1 bg-transparent border-none outline-none ${
            darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
          }`}
        />
      </div>

      {/* Filter Buttons */}
      <div className="overflow-x-auto pb-2 mb-4">
        <div className="flex gap-2 min-w-max">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                selectedFilter === filter.id
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter.icon && <filter.icon size={16} />}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="mb-4">メニューがまだありません</div>
          <button className="bg-gradient-primary text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200">
            新規作成
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrompts.map((prompt, index) => (
            <div
              key={prompt.id || index}
              className={`${
                darkMode ? 'bg-dark-secondary' : 'bg-white'
              } rounded-xl shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200 p-4 animate-fadeIn`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {prompt.title}
                  </h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getCategoryColor(getPromptCategory(prompt))} mt-1`}>
                    {getPromptCategory(prompt)}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleFavorite(prompt)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      prompt.isFavorite
                        ? 'text-yellow-500 hover:scale-110 animate-pulse'
                        : darkMode
                        ? 'text-gray-400 hover:text-yellow-500'
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star size={16} className={prompt.isFavorite ? 'fill-current' : ''} />
                  </button>
                  
                  <button
                    onClick={() => handleCopyPrompt(prompt)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      copiedPromptId === prompt.id?.toString()
                        ? 'text-green-500'
                        : darkMode
                        ? 'text-gray-400 hover:text-blue-400'
                        : 'text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    {copiedPromptId === prompt.id?.toString() ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeletePrompt(prompt.id?.toString() || '')}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      darkMode
                        ? 'text-gray-400 hover:text-red-400'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Description */}
              {prompt.description && (
                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {prompt.description}
                </p>
              )}

              {/* Footer */}
              <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>
                  {new Date(prompt.createdAt).toLocaleDateString('ja-JP')} • {prompt.usageCount || 0}回使用
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}