import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptDisplay } from '../../../../src/components/prompt/PromptDisplay'

// Mock hooks
vi.mock('../../../../src/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'aiPrompt': 'AI Prompt',
        'promptDescription': 'Copy and paste this to your AI tool',
        'copied': 'Copied',
        'copy': 'Copy',
        'promptPlaceholder': 'Your prompt will appear here'
      }
      return translations[key] || key
    }
  })
}))

vi.mock('../../../../src/hooks/useTheme', () => ({
  useTheme: () => ({
    darkMode: false
  })
}))

describe('PromptDisplay', () => {
  const defaultProps = {
    prompt: 'Test prompt content',
    onCopy: vi.fn(),
    copied: false,
    loading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with prompt content', () => {
      render(<PromptDisplay {...defaultProps} />)

      expect(screen.getByText('AI Prompt')).toBeInTheDocument()
      expect(screen.getByText('Copy and paste this to your AI tool')).toBeInTheDocument()
      expect(screen.getByText('Test prompt content')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })

    it('should render placeholder when no prompt provided', () => {
      render(<PromptDisplay {...defaultProps} prompt="" />)

      expect(screen.getByText('Your prompt will appear here')).toBeInTheDocument()
      expect(screen.queryByText('Test prompt content')).not.toBeInTheDocument()
    })

    it('should render with loading state', () => {
      render(<PromptDisplay {...defaultProps} loading={true} />)

      const copyButton = screen.getByRole('button')
      expect(copyButton).toBeDisabled()
      expect(copyButton).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('should render with copied state', () => {
      render(<PromptDisplay {...defaultProps} copied={true} />)

      expect(screen.getByText('Copied')).toBeInTheDocument()
      expect(screen.queryByText('Copy')).not.toBeInTheDocument()
      
      const copyButton = screen.getByRole('button')
      expect(copyButton).toHaveClass('animate-pulse')
    })
  })

  describe('interactions', () => {
    it('should call onCopy when copy button is clicked', () => {
      const mockOnCopy = vi.fn()
      render(<PromptDisplay {...defaultProps} onCopy={mockOnCopy} />)

      const copyButton = screen.getByRole('button')
      fireEvent.click(copyButton)

      expect(mockOnCopy).toHaveBeenCalledTimes(1)
    })

    it('should not call onCopy when button is disabled (no prompt)', () => {
      const mockOnCopy = vi.fn()
      render(<PromptDisplay {...defaultProps} prompt="" onCopy={mockOnCopy} />)

      const copyButton = screen.getByRole('button')
      expect(copyButton).toBeDisabled()
      
      fireEvent.click(copyButton)
      expect(mockOnCopy).not.toHaveBeenCalled()
    })

    it('should not call onCopy when button is disabled (loading)', () => {
      const mockOnCopy = vi.fn()
      render(<PromptDisplay {...defaultProps} loading={true} onCopy={mockOnCopy} />)

      const copyButton = screen.getByRole('button')
      expect(copyButton).toBeDisabled()
      
      fireEvent.click(copyButton)
      expect(mockOnCopy).not.toHaveBeenCalled()
    })
  })

  describe('dark mode', () => {
    beforeEach(() => {
      vi.resetModules()
      vi.mock('../../../../src/hooks/useTheme', () => ({
        useTheme: () => ({
          darkMode: true
        })
      }))
    })

    it('should apply dark mode classes', () => {
      render(<PromptDisplay {...defaultProps} />)

      // Check for dark mode classes in various elements
      const titleElement = screen.getByText('AI Prompt')
      expect(titleElement).toHaveClass('text-white')

      const descriptionElement = screen.getByText('Copy and paste this to your AI tool')
      expect(descriptionElement).toHaveClass('text-gray-400')

      const contentElement = screen.getByText('Test prompt content')
      expect(contentElement).toHaveClass('text-gray-100')
    })
  })

  describe('accessibility', () => {
    it('should have accessible button', () => {
      render(<PromptDisplay {...defaultProps} />)

      const copyButton = screen.getByRole('button')
      expect(copyButton).toBeInTheDocument()
      expect(copyButton).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('should have accessible button when disabled', () => {
      render(<PromptDisplay {...defaultProps} prompt="" />)

      const copyButton = screen.getByRole('button')
      expect(copyButton).toBeInTheDocument()
      expect(copyButton).toBeDisabled()
    })

    it('should have proper content structure', () => {
      render(<PromptDisplay {...defaultProps} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('AI Prompt')
    })
  })

  describe('icons', () => {
    it('should show copy icon when not copied', () => {
      render(<PromptDisplay {...defaultProps} copied={false} />)

      // The Copy icon should be present (imported from lucide-react)
      const copyButton = screen.getByRole('button')
      expect(copyButton).toHaveTextContent('Copy')
    })

    it('should show check icon when copied', () => {
      render(<PromptDisplay {...defaultProps} copied={true} />)

      // The Check icon should be present (imported from lucide-react)
      const copyButton = screen.getByRole('button')
      expect(copyButton).toHaveTextContent('Copied')
    })
  })
})