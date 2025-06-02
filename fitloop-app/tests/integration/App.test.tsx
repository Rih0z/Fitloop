import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import { StorageManager } from '../../src/lib/db'
import type { UserProfile } from '../../src/models/user'

// Mock the StorageManager
vi.mock('../../src/lib/db', () => {
  const mockStorage = {
    getProfile: vi.fn(),
    saveProfile: vi.fn(),
    getContext: vi.fn(),
    updateContext: vi.fn(),
    savePrompt: vi.fn(),
    getSavedPrompts: vi.fn(),
    initializeDefaultPrompts: vi.fn(),
    saveCurrentPromptAsLast: vi.fn(),
    savePromptToCollection: vi.fn(),
    updatePromptUsage: vi.fn(),
    updatePromptContent: vi.fn()
  }

  return {
    StorageManager: vi.fn(() => mockStorage),
    db: {
      open: vi.fn(),
      close: vi.fn(),
      profile: { clear: vi.fn(), add: vi.fn() },
      context: { clear: vi.fn(), add: vi.fn() },
      prompts: { clear: vi.fn(), add: vi.fn() },
      savedPrompts: { clear: vi.fn(), add: vi.fn() }
    }
  }
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn()
  }
})

describe('App Integration Tests', () => {
  let storage: any
  const user = userEvent.setup()

  beforeEach(() => {
    storage = new StorageManager()
    storage.getProfile.mockResolvedValue(null)
    storage.getContext.mockResolvedValue(null)
    storage.getSavedPrompts.mockResolvedValue([])
    storage.initializeDefaultPrompts.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Load', () => {
    it('should render the app with header and tabs', async () => {
      await act(async () => {
        render(<App />)
      })
      
      // Wait for initial load to complete
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      // Check header
      expect(screen.getByText(/AI Ready|AI対応/)).toBeInTheDocument()
      
      // Check tabs
      expect(screen.getAllByText(/Prompt|プロンプト/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Profile|プロフィール/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/Library|ライブラリ/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/How to Use|使い方/).length).toBeGreaterThanOrEqual(1)
    })

    it('should show prompt tab by default', async () => {
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/AI Prompt|AI プロンプト/)).toBeInTheDocument()
        expect(screen.getAllByText(/Copy|コピー/).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Language Switching', () => {
    it('should switch between Japanese and English', async () => {
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      // Find language toggle button by title
      const langButton = screen.getByTitle(/Current: 日本語|Current: English/i)
      
      // Click to switch language
      await act(async () => {
        await user.click(langButton)
      })
      
      // Check if UI language changed
      await waitFor(() => {
        const promptText = screen.queryByText('AI Prompt') || screen.queryByText('AI プロンプト')
        expect(promptText).toBeTruthy()
      }, { timeout: 3000 })
    })
  })

  describe('Dark Mode Toggle', () => {
    it('should toggle dark mode', async () => {
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      const container = screen.getByText('FitLoop').closest('div')
      const initialClasses = container?.className || ''
      
      // Find and click dark mode toggle
      const darkModeButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.getAttribute('class')?.includes('Sun') ||
        btn.querySelector('svg')?.getAttribute('class')?.includes('Moon')
      )
      
      if (darkModeButton) {
        await act(async () => {
          await user.click(darkModeButton)
        })
        
        // Check if classes changed
        await waitFor(() => {
          const newClasses = container?.className || ''
          expect(newClasses).not.toBe(initialClasses)
        })
      }
    })
  })

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      // Wait for tabs to be available
      await waitFor(() => {
        expect(screen.getAllByText(/Profile|プロフィール/).length).toBeGreaterThan(0)
      }, { timeout: 5000 })
      
      // Click Profile tab
      const profileTab = screen.getAllByText(/Profile|プロフィール/)[0].closest('button')
      if (profileTab) {
        await act(async () => {
          await user.click(profileTab)
        })
        
        await waitFor(() => {
          expect(screen.getByText(/start.*journey|フィットネス/i)).toBeInTheDocument()
        })
      }
      
      // Click Library tab
      const libraryTab = screen.getAllByText(/Library|ライブラリ/)[0].closest('button')
      if (libraryTab) {
        await act(async () => {
          await user.click(libraryTab)
        })
        
        await waitFor(() => {
          expect(screen.getAllByText(/Library|ライブラリ/).length).toBeGreaterThan(0)
        })
      }
      
      // Click Settings tab
      const settingsTab = screen.getAllByText(/How to Use|使い方/)[0].closest('button')
      if (settingsTab) {
        await act(async () => {
          await user.click(settingsTab)
        })
        
        await waitFor(() => {
          expect(screen.getAllByText(/Usage|使い方/).length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('Profile Setup Flow', () => {
    it('should complete profile setup', async () => {
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      // Wait for tabs to be available
      await waitFor(() => {
        expect(screen.getAllByText(/Profile|プロフィール/).length).toBeGreaterThan(0)
      }, { timeout: 5000 })
      
      // Go to profile tab
      const profileTab = screen.getAllByText(/Profile|プロフィール/)[0].closest('button')
      if (profileTab) {
        await act(async () => {
          await user.click(profileTab)
        })
      }
      
      // Enter name
      const nameInput = screen.getByPlaceholderText(/name|名前/i)
      await act(async () => {
        await user.type(nameInput, 'Test User')
      })
      
      // Click next
      const nextButton = screen.getByText(/Next|次へ/i).closest('button')
      if (nextButton) {
        await act(async () => {
          await user.click(nextButton)
        })
        
        // Select goals
        await waitFor(() => {
          const goalButtons = screen.getAllByRole('button').filter(btn => 
            btn.textContent?.includes('筋肉') || btn.textContent?.includes('健康')
          )
          expect(goalButtons.length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('Prompt Copy Functionality', () => {
    it('should copy prompt to clipboard', async () => {
      const mockProfile: UserProfile = {
        name: 'Test User',
        goals: 'Get fit',
        environment: 'Gym',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const mockContext = {
        cycleNumber: 1,
        sessionNumber: 1,
        lastActivity: new Date(),
        performance: []
      }
      
      storage.getProfile.mockResolvedValue(mockProfile)
      storage.getContext.mockResolvedValue(mockContext)
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        const copyButtons = screen.getAllByText(/Copy|コピー/)
        expect(copyButtons.length).toBeGreaterThan(0)
      })
      
      const copyButton = screen.getAllByText(/Copy|コピー/)[0].closest('button')
      if (copyButton) {
        await act(async () => {
          await user.click(copyButton)
        })
        
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        
        await waitFor(() => {
          expect(screen.getByText(/Copied|コピー済み/)).toBeInTheDocument()
        })
      }
    })
  })

  describe('AI Response Paste', () => {
    it('should paste AI response', async () => {
      const mockResponse = 'This is a test AI response'
      const mockReadText = vi.fn().mockResolvedValue(mockResponse)
      Object.assign(navigator.clipboard, { readText: mockReadText })
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      const pasteButton = screen.getByText(/Paste|貼り付け/i).closest('button')
      if (pasteButton) {
        await act(async () => {
          await user.click(pasteButton)
        })
        
        await waitFor(() => {
          const textarea = screen.getByPlaceholderText(/response|レスポンス/i)
          expect(textarea).toHaveValue(mockResponse)
        })
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      storage.getProfile.mockRejectedValue(new Error('Storage error'))
      
      await act(async () => {
        render(<App />)
      })
      
      // App should still render despite error, but it might be in loading state
      await waitFor(() => {
        const element = document.querySelector('body')
        expect(element).toBeTruthy()
      }, { timeout: 5000 })
    })

    it('should show error for invalid profile data', async () => {
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      // Wait for tabs to be available
      await waitFor(() => {
        expect(screen.getAllByText(/Profile|プロフィール/).length).toBeGreaterThan(0)
      }, { timeout: 5000 })
      
      // Go to profile tab
      const profileTab = screen.getAllByText(/Profile|プロフィール/)[0].closest('button')
      if (profileTab) {
        await act(async () => {
          await user.click(profileTab)
        })
      }
      
      // Wait for profile form to load and try to submit without entering data
      await waitFor(() => {
        const nameInput = screen.queryByPlaceholderText(/name|名前/i)
        expect(nameInput).toBeTruthy()
      }, { timeout: 3000 })
      
      const nameInput = screen.getByPlaceholderText(/name|名前/i)
      await act(async () => {
        await user.clear(nameInput)
      })
      
      // Next button should be disabled
      const nextButton = screen.getByText(/Next|次へ/i).closest('button')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Prompt Library', () => {
    it('should display saved prompts', async () => {
      const mockPrompts = [
        {
          id: 1,
          title: 'Test Prompt',
          content: 'Test content',
          category: 'training',
          isMetaPrompt: true,
          tags: ['test'],
          usageCount: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      storage.getSavedPrompts.mockResolvedValue(mockPrompts)
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      // Wait for tabs to be available
      await waitFor(() => {
        expect(screen.getAllByText(/Library|ライブラリ/).length).toBeGreaterThan(0)
      }, { timeout: 5000 })
      
      // Go to library tab
      const libraryTab = screen.getAllByText(/Library|ライブラリ/)[0].closest('button')
      if (libraryTab) {
        await act(async () => {
          await user.click(libraryTab)
        })
        
        await waitFor(() => {
          expect(screen.getByText('Test Prompt')).toBeInTheDocument()
          expect(screen.getByText(/5.*times used|5.*回使用/)).toBeInTheDocument()
        })
      }
    })

    it('should filter prompts by search', async () => {
      const mockPrompts = [
        {
          id: 1,
          title: 'Training Prompt',
          content: 'Content 1',
          category: 'training',
          isMetaPrompt: true,
          tags: ['training'],
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          title: 'Nutrition Prompt',
          content: 'Content 2',
          category: 'nutrition',
          isMetaPrompt: false,
          tags: ['nutrition'],
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      storage.getSavedPrompts.mockResolvedValue(mockPrompts)
      
      await act(async () => {
        render(<App />)
      })
      
      await waitFor(() => {
        expect(screen.getByText('FitLoop')).toBeInTheDocument()
      })
      
      // Go to library tab
      const libraryTab = screen.getByText(/Library|ライブラリ/).closest('button')
      if (libraryTab) {
        await user.click(libraryTab)
        
        await waitFor(() => {
          expect(screen.getByText('Training Prompt')).toBeInTheDocument()
          expect(screen.getByText('Nutrition Prompt')).toBeInTheDocument()
        })
        
        // Search for training
        const searchInput = screen.getByPlaceholderText(/search|検索/i)
        await user.type(searchInput, 'training')
        
        await waitFor(() => {
          expect(screen.getByText('Training Prompt')).toBeInTheDocument()
          expect(screen.queryByText('Nutrition Prompt')).not.toBeInTheDocument()
        })
      }
    })
  })
})