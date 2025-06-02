import React, { useState, useEffect } from 'react'
import { BookOpen, Search, Clock, Star, Copy, Trash2, ChevronRight, Sparkles } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { StorageManager } from '../../lib/db'
import type { SavedPrompt } from '../../models/promptCollection'

const storage = new StorageManager()

export const PromptLibrary: React.FC = () => {
  const { darkMode } = useTheme()
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<SavedPrompt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', label: 'すべて', icon: BookOpen, count: prompts.length },
    { id: 'training', label: 'トレーニング', icon: Sparkles, count: prompts.filter(p => p.category === 'training').length },
    { id: 'custom', label: 'カスタム', icon: Star, count: prompts.filter(p => p.category === 'custom').length }
  ]

  useEffect(() => {
    loadPrompts()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [searchQuery, selectedCategory, prompts])

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

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredPrompts(filtered)
  }

  const handleCopyPrompt = async (prompt: SavedPrompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      await storage.updatePromptUsage(prompt.id!)
      await loadPrompts()
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  const handleDeletePrompt = async (promptId: number) => {
    if (confirm('このプロンプトを削除しますか？')) {
      try {
        await storage.deletePrompt(promptId)
        await loadPrompts()
      } catch (error) {
        console.error('Failed to delete prompt:', error)
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen pb-20`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="p-4">
          <h1 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            プロンプトライブラリ
          </h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="プロンプトを検索..."
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? darkMode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === category.id
                      ? 'bg-white/20'
                      : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {category.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Prompts List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`rounded-2xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} skeleton-loader`}>
                <div className="h-6 w-3/4 mb-2 rounded" />
                <div className="h-4 w-full mb-2 rounded" />
                <div className="h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>プロンプトが見つかりません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPrompts.map(prompt => (
              <div
                key={prompt.id}
                className={`group rounded-2xl p-4 transition-all ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                    : 'bg-white hover:shadow-lg border border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {prompt.title}
                  </h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyPrompt(prompt)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                      title="コピー"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {prompt.category === 'custom' && (
                      <button
                        onClick={() => handleDeletePrompt(prompt.id!)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-red-900/50 text-gray-400 hover:text-red-400' 
                            : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
                        }`}
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {prompt.description && (
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {prompt.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {prompt.isMetaPrompt && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      メタプロンプト
                    </span>
                  )}
                  {prompt.tags?.map(tag => (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(prompt.lastUsed || new Date())}
                    </span>
                    {prompt.usageCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {prompt.usageCount}回使用
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}