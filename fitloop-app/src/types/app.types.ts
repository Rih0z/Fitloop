export type TabType = 'prompt' | 'profile' | 'library' | 'help'

export interface TabItem {
  id: TabType
  icon: React.ComponentType<{ size?: number }>
  labelKey: string
}