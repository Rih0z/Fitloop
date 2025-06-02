export type TabType = 'prompt' | 'profile' | 'library' | 'settings'

export interface TabItem {
  id: TabType
  icon: React.ComponentType<{ size?: number }>
  labelKey: string
}