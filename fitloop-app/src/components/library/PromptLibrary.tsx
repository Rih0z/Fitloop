import React, { useState, useEffect } from 'react'
import { BookOpen, Search, Star, Copy, Trash2, ChevronRight, Sparkles, User, Target } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { StorageManager } from '../../lib/db'
import type { SavedPrompt } from '../../models/promptCollection'
import type { GeneratedPrompt } from '../../models/prompt'

const storage = new StorageManager()

type UnifiedPrompt = (SavedPrompt | GeneratedPrompt) & {
  promptType: 'saved' | 'generated'
}

export const PromptLibrary: React.FC = () => {
  const { darkMode } = useTheme()
  const [allPrompts, setAllPrompts] = useState<UnifiedPrompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<UnifiedPrompt[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const getPromptCategory = (prompt: UnifiedPrompt): string => {
    if (prompt.promptType === 'saved') {
      return (prompt as SavedPrompt).category || 'custom'
    } else {
      return (prompt as GeneratedPrompt).type || 'training'
    }
  }

  const getPromptSource = (prompt: UnifiedPrompt): string => {
    if (prompt.promptType === 'generated') {
      return (prompt as GeneratedPrompt).source || 'manual'
    }
    return 'manual'
  }

  const getPromptTitle = (prompt: UnifiedPrompt): string => {
    if (prompt.promptType === 'saved') {
      return (prompt as SavedPrompt).title
    } else {
      const generated = prompt as GeneratedPrompt
      return generated.title || `${generated.type}プロンプト`
    }
  }

  const getPromptContent = (prompt: UnifiedPrompt): string => {
    return prompt.content
  }

  const categories = [
    { id: 'all', label: 'すべて', icon: BookOpen, count: allPrompts.length },
    { id: 'training', label: 'トレーニング', icon: Sparkles, count: allPrompts.filter(p => getPromptCategory(p) === 'training').length },
    { id: 'custom', label: 'カスタム', icon: Star, count: allPrompts.filter(p => getPromptCategory(p) === 'custom').length }
  ]

  const sources = [
    { id: 'all', label: 'すべて', icon: BookOpen, count: allPrompts.length },
    { id: 'profile', label: 'プロフィール', icon: User, count: allPrompts.filter(p => getPromptSource(p) === 'profile').length },
    { id: 'training', label: 'トレーニング記録', icon: Target, count: allPrompts.filter(p => getPromptSource(p) === 'training').length },
    { id: 'manual', label: '手動作成', icon: Star, count: allPrompts.filter(p => getPromptSource(p) === 'manual').length }
  ]

  useEffect(() => {
    loadPrompts()
  }, [])

  useEffect(() => {
    filterPrompts()
  }, [searchQuery, selectedCategory, selectedSource, allPrompts])

  const loadPrompts = async () => {
    setLoading(true)
    try {
      const [savedPrompts, generatedPrompts] = await Promise.all([
        storage.getSavedPrompts(),
        storage.getGeneratedPrompts()
      ])
      
      const unifiedPrompts: UnifiedPrompt[] = [
        ...savedPrompts.map((p: SavedPrompt) => ({ ...p, promptType: 'saved' as const })),
        ...generatedPrompts.map((p: GeneratedPrompt) => ({ ...p, promptType: 'generated' as const }))
      ]
      
      // Sort by creation date, newest first
      unifiedPrompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setAllPrompts(unifiedPrompts)
    } catch (error) {
      console.error('Failed to load prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPrompts = () => {
    let filtered = allPrompts

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => getPromptCategory(p) === selectedCategory)
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(p => getPromptSource(p) === selectedSource)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => {
        const title = getPromptTitle(p).toLowerCase()
        const content = getPromptContent(p).toLowerCase()
        
        if (p.promptType === 'saved') {
          const saved = p as SavedPrompt
          return title.includes(query) ||
                 content.includes(query) ||
                 saved.description?.toLowerCase().includes(query) ||
                 saved.tags?.some(tag => tag.toLowerCase().includes(query))
        } else {
          return title.includes(query) || content.includes(query)
        }
      })
    }

    setFilteredPrompts(filtered)
  }

  const handleCopyPrompt = async (prompt: UnifiedPrompt) => {
    try {
      await navigator.clipboard.writeText(getPromptContent(prompt))
      
      if (prompt.promptType === 'saved' && prompt.id) {
        await storage.updatePromptUsage(prompt.id)
      } else if (prompt.promptType === 'generated' && prompt.id) {
        // Update usage for generated prompts
        const generatedPrompt = prompt as GeneratedPrompt
        await storage.updateGeneratedPrompt(prompt.id, { ...generatedPrompt, used: true })
      }
      
      await loadPrompts()
    } catch (error) {
      console.error('Failed to copy prompt:', error)
    }
  }

  const handleDeletePrompt = async (prompt: UnifiedPrompt) => {
    if (confirm('このプロンプトを削除しますか？')) {
      try {
        if (prompt.promptType === 'saved' && prompt.id) {
          await storage.deletePrompt(prompt.id)
        } else if (prompt.promptType === 'generated' && prompt.id) {
          await storage.deleteGeneratedPrompt(prompt.id)
        }
        await loadPrompts()
      } catch (error) {
        console.error('Failed to delete prompt:', error)
      }
    }
  }

  const formatDate = (date: Date | string) => {
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
              placeholder="プロンプトやタイトルを検索..."
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Category Filters */}
            <div>
              <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>カテゴリ</p>
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

            {/* Source Filters */}
            <div>
              <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>作成元</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {sources.map(source => {
                  const Icon = source.icon
                  return (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-sm ${
                        selectedSource === source.id
                          ? darkMode
                            ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                          : darkMode
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="font-medium">{source.label}</span>
                      <span className={`text-xs px-1 py-0.5 rounded-full ${
                        selectedSource === source.id
                          ? 'bg-white/20'
                          : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        {source.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
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
            <p className="text-lg font-medium mb-2">プロンプトが見つかりません</p>
            <p className="text-sm mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedSource !== 'all'
                ? 'フィルターを調整してみてください'
                : 'プロフィール保存やトレーニング記録でプロンプトを生成しましょう'}
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedSource !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedSource('all')
                }}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                すべてのフィルターをクリア
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPrompts.map(prompt => (
              <div
                key={`${prompt.promptType}-${prompt.id}`}
                className={`group rounded-2xl p-4 transition-all ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                    : 'bg-white hover:shadow-lg border border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getPromptTitle(prompt)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getPromptSource(prompt) === 'profile'
                          ? 'bg-purple-500/20 text-purple-500'
                          : getPromptSource(prompt) === 'training'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {getPromptSource(prompt) === 'profile' ? '👤 プロフィール' :
                         getPromptSource(prompt) === 'training' ? '📋 トレーニング記録' : '✏️ 手動作成'}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDate(prompt.createdAt)}
                      </span>
                    </div>
                  </div>
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
                    {((prompt.promptType === 'saved' && (prompt as SavedPrompt).category === 'custom') || 
                      (prompt.promptType === 'generated')) && (
                      <button
                        onClick={() => handleDeletePrompt(prompt)}
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

                {prompt.promptType === 'saved' && (prompt as SavedPrompt).description && (
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {(prompt as SavedPrompt).description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {prompt.promptType === 'saved' && (prompt as SavedPrompt).isMetaPrompt && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      メタプロンプト
                    </span>
                  )}
                  {prompt.promptType === 'saved' && (prompt as SavedPrompt).tags?.map(tag => (
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
                    {prompt.promptType === 'saved' && (prompt as SavedPrompt).usageCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {(prompt as SavedPrompt).usageCount}回使用
                      </span>
                    )}
                    {prompt.promptType === 'generated' && (prompt as GeneratedPrompt).used && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        使用済み
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