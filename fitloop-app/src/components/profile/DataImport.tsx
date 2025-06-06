import React, { useState } from 'react'
import { Copy, Upload, CheckCircle, AlertTriangle, FileText, Bot, Zap } from 'lucide-react'
import { generateDataImportPrompt, validateImportData, convertToUserProfile, type ImportDataStructure } from '../../lib/dataImportPrompt'
import { useProfile } from '../../hooks/useProfile'
import { useClipboard } from '../../hooks/useClipboard'

interface DataImportProps {
  onComplete?: () => void
  onCancel?: () => void
}

export const DataImport: React.FC<DataImportProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<'prompt' | 'paste' | 'processing' | 'complete'>('prompt')
  const [jsonData, setJsonData] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [importedData, setImportedData] = useState<ImportDataStructure | null>(null)
  
  const { saveProfile } = useProfile()
  const { copy } = useClipboard()

  const importPrompt = generateDataImportPrompt()

  const handleCopyPrompt = async () => {
    await copy(importPrompt)
  }

  const handleJsonPaste = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(event.target.value)
    setValidationErrors([])
  }

  const handleValidateAndImport = async () => {
    if (!jsonData.trim()) {
      setValidationErrors(['JSONデータを入力してください'])
      return
    }

    setCurrentStep('processing')

    try {
      const validation = validateImportData(jsonData)
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors || ['データの検証に失敗しました'])
        setCurrentStep('paste')
        return
      }

      setImportedData(validation.data!)
      
      // 既存のプロフィール形式に変換
      const userProfile = convertToUserProfile(validation.data!)
      
      // プロフィールを保存
      await saveProfile(userProfile)
      
      setCurrentStep('complete')
      
    } catch (error) {
      setValidationErrors(['データの処理中にエラーが発生しました'])
      setCurrentStep('paste')
    }
  }

  const handleNewImport = () => {
    setCurrentStep('prompt')
    setJsonData('')
    setValidationErrors([])
    setImportedData(null)
  }

  const renderPromptStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Bot className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AIデータインポート
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Claude、Gemini、ChatGPTなどのAIツールを使用して、現在のフィットネス状況を効率的に収集します
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-6 w-6 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            使用方法
          </h3>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>下記のプロンプトをコピーしてください</li>
          <li>Claude、Gemini、ChatGPTなどのAIツールを開いてください</li>
          <li>プロンプトを貼り付けて送信してください</li>
          <li>AIの質問に答えて、フィットネス情報を提供してください</li>
          <li>スクリーンショットがあれば一緒に共有してください</li>
          <li>完了後、AIが出力するJSONデータをこのアプリに貼り付けてください</li>
        </ol>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              データインポートプロンプト
            </span>
          </div>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            <Copy className="h-4 w-4" />
            コピー
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded border max-h-64 overflow-y-auto">
          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
            {importPrompt}
          </pre>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep('paste')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          次へ - JSONデータを貼り付け
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    </div>
  )

  const renderPasteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          JSONデータを貼り付け
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          AIツールから出力されたJSONデータを下記に貼り付けてください
        </p>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800 dark:text-red-200">
              データエラー
            </span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          JSONデータ
        </label>
        <textarea
          value={jsonData}
          onChange={handleJsonPaste}
          placeholder="AIツールから出力されたJSONデータをここに貼り付けてください..."
          className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleValidateAndImport}
          disabled={!jsonData.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          データをインポート
        </button>
        <button
          onClick={() => setCurrentStep('prompt')}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          戻る
        </button>
      </div>
    </div>
  )

  const renderProcessingStep = () => (
    <div className="text-center space-y-6">
      <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          データを処理中...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          インポートデータを検証・変換しています
        </p>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          インポート完了
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          データが正常にインポートされ、プロフィールが更新されました
        </p>
      </div>

      {importedData && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
            インポートされた情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-green-700 dark:text-green-300">名前:</span>
              <span className="ml-2 text-green-600 dark:text-green-400">
                {importedData.profile.name}
              </span>
            </div>
            {importedData.profile.age && (
              <div>
                <span className="font-medium text-green-700 dark:text-green-300">年齢:</span>
                <span className="ml-2 text-green-600 dark:text-green-400">
                  {importedData.profile.age}歳
                </span>
              </div>
            )}
            {importedData.goals.primary && (
              <div>
                <span className="font-medium text-green-700 dark:text-green-300">主要目標:</span>
                <span className="ml-2 text-green-600 dark:text-green-400">
                  {importedData.goals.primary}
                </span>
              </div>
            )}
            {importedData.experience?.level && (
              <div>
                <span className="font-medium text-green-700 dark:text-green-300">経験レベル:</span>
                <span className="ml-2 text-green-600 dark:text-green-400">
                  {importedData.experience.level}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          完了
        </button>
        <button
          onClick={handleNewImport}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          新しいインポート
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        {currentStep === 'prompt' && renderPromptStep()}
        {currentStep === 'paste' && renderPasteStep()}
        {currentStep === 'processing' && renderProcessingStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  )
}