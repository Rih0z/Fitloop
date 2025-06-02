import { useState, useCallback } from 'react'
import type { TabType } from '../types/app.types'

export function useTabs(initialTab: TabType = 'prompt') {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  const changeTab = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  return {
    activeTab,
    changeTab
  }
}