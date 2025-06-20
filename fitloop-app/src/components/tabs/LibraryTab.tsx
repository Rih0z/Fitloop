import React, { useState } from 'react'
import { Plus, Search, Star, Copy, Check, Trash2 } from 'lucide-react'
import { useClipboard } from '../../hooks/useClipboard'

// 新デザインシステム完全準拠 - ライブラリタブ実装

interface Menu {
  id: number
  date: string
  title: string
  category: '上半身' | '下半身' | '全身'
  description: string
  exercises: string[]
  duration: string
  isFavorite: boolean
}

// デフォルトメニューデータ
const DEFAULT_MENUS: Menu[] = [
  {
    id: 1,
    date: '2024-06-04',
    title: '胸筋強化メニュー',
    category: '上半身',
    description: 'ダンベルベンチプレス中心の胸筋メニュー',
    exercises: ['ダンベルベンチプレス', 'インクラインフライ', 'トライセプス'],
    duration: '35分',
    isFavorite: true
  },
  {
    id: 2,
    date: '2024-06-03',
    title: '背中・二頭筋メニュー',
    category: '上半身',
    description: 'ダンベルロウ中心の背中強化メニュー',
    exercises: ['ダンベルロウ', 'ラットプルダウン', 'ダンベルカール'],
    duration: '40分',
    isFavorite: false
  },
  {
    id: 3,
    date: '2024-06-02',
    title: '脚・コア集中',
    category: '下半身',
    description: 'スクワット中心の下半身強化',
    exercises: ['ダンベルスクワット', 'ルーマニアンデッドリフト', 'プランク'],
    duration: '45分',
    isFavorite: true
  },
  {
    id: 4,
    date: '2024-06-01',
    title: '肩・前腕メニュー',
    category: '上半身',
    description: 'ショルダープレス中心の肩強化',
    exercises: ['ダンベルショルダープレス', 'ラテラルレイズ', 'リストカール'],
    duration: '30分',
    isFavorite: false
  },
  {
    id: 5,
    date: '2024-05-31',
    title: '全身サーキット',
    category: '全身',
    description: 'HIITを含む全身強化プログラム',
    exercises: ['スラスター', 'バーピー', 'マウンテンクライマー'],
    duration: '25分',
    isFavorite: true
  }
]

export const LibraryTab: React.FC = () => {
  const { copy } = useClipboard()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'upper' | 'lower' | 'full' | 'favorite'>('all')
  const [menus, setMenus] = useState<Menu[]>(DEFAULT_MENUS)
  const [copiedMenuId, setCopiedMenuId] = useState<number | null>(null)

  const handleCreateMenu = () => {
    console.log('新規メニュー作成')
  }

  const handleCopyMenu = async (menu: Menu) => {
    try {
      const menuText = `# ${menu.title}\n\n${menu.description}\n\n**エクササイズ:**\n${menu.exercises.map(ex => `- ${ex}`).join('\n')}\n\n**所要時間:** ${menu.duration}`
      await copy(menuText)
      setCopiedMenuId(menu.id)
      setTimeout(() => setCopiedMenuId(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleToggleFavorite = (menuId: number) => {
    setMenus(prev => prev.map(menu => 
      menu.id === menuId ? { ...menu, isFavorite: !menu.isFavorite } : menu
    ))
  }

  const handleDeleteMenu = (menuId: number) => {
    if (window.confirm('このメニューを削除しますか？')) {
      setMenus(prev => prev.filter(menu => menu.id !== menuId))
    }
  }

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         menu.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = activeFilter === 'all' ||
                         (activeFilter === 'favorite' && menu.isFavorite) ||
                         (activeFilter === 'upper' && menu.category === '上半身') ||
                         (activeFilter === 'lower' && menu.category === '下半身') ||
                         (activeFilter === 'full' && menu.category === '全身')
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      <button
        onClick={handleCreateMenu}
        className="btn btn-gradient-primary btn-full btn-icon-text btn-micro animate-bounce-in"
      >
        <Plus size={20} />
        <span className="font-medium">新規メニュー作成</span>
      </button>

      <div className="card-glass h-12 flex items-center px-4 animate-bounce-in card-hover-lift">
        <Search size={20} className="text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="メニューを検索..."
          className="flex-1 ml-3 bg-transparent border-none outline-none text-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 animate-fade-in">
        {[
          { id: 'all', label: 'すべて' },
          { id: 'favorite', label: 'お気に入り', icon: Star },
          { id: 'upper', label: '上半身' },
          { id: 'lower', label: '下半身' },
          { id: 'full', label: '全身' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`
              btn btn-secondary btn-micro px-4 py-2 whitespace-nowrap
              flex items-center gap-1.5 text-sm
              ${activeFilter === filter.id ? 'btn-primary feedback-success' : ''}
            `}
          >
            {filter.icon && <filter.icon size={14} />}
            <span className="font-medium">{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredMenus.map((menu, index) => (
          <div
            key={menu.id}
            className="card-glass card-interactive card-hover-lift animate-bounce-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="heading-3 mb-1">
                  {menu.title}
                </h3>
                <span className={`category-${menu.category === '上半身' ? 'upper' : menu.category === '下半身' ? 'lower' : 'full'} inline-block px-2 py-1 rounded-full text-xs font-medium`}>
                  {menu.category}
                </span>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleToggleFavorite(menu.id)}
                  className={`
                    btn-icon btn-micro w-8 h-8 hover:scale-110
                    ${menu.isFavorite ? 'text-yellow-500 animate-heartbeat' : 'hover:text-yellow-500'}
                  `}
                >
                  <Star size={16} fill={menu.isFavorite ? 'currentColor' : 'none'} />
                </button>
                
                <button
                  onClick={() => handleCopyMenu(menu)}
                  className={`
                    btn-icon btn-micro w-8 h-8 hover:scale-110
                    ${copiedMenuId === menu.id ? 'text-green-500 feedback-success' : 'hover:text-green-500'}
                  `}
                >
                  {copiedMenuId === menu.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
                
                <button
                  onClick={() => handleDeleteMenu(menu.id)}
                  className="btn-icon btn-micro w-8 h-8 hover:scale-110 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-sm mb-3 text-secondary">
              {menu.description}
            </p>

            <div className="flex items-center justify-between text-sm text-tertiary">
              <span>{menu.exercises.length}種目</span>
              <span>•</span>
              <span>{menu.duration}</span>
              <span>•</span>
              <span>{menu.date}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredMenus.length === 0 && (
        <div className="text-center py-12 text-tertiary">
          <p>該当するメニューが見つかりません</p>
        </div>
      )}
    </div>
  )
}