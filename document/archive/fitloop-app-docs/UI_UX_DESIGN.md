# FitLoop アプリケーション UI/UX 完全実装仕様書

## 目次
1. [プロジェクト概要](#1-プロジェクト概要)
2. [デザインシステム](#2-デザインシステム)
3. [グローバルコンポーネント](#3-グローバルコンポーネント)
4. [画面別詳細仕様](#4-画面別詳細仕様)
5. [インタラクション仕様](#5-インタラクション仕様)
6. [状態管理仕様](#6-状態管理仕様)
7. [アニメーション仕様](#7-アニメーション仕様)
8. [レスポンシブ対応](#8-レスポンシブ対応)
9. [アクセシビリティ](#9-アクセシビリティ)
10. [パフォーマンス要件](#10-パフォーマンス要件)

---

## 1. プロジェクト概要

### 1.1 アプリケーション名
**FitLoop** - AIメタプロンプト駆動型フィットネストレーニングアプリ

### 1.2 コアコンセプト
「プロンプトがプロンプトを生む」革新的なメタプロンプトシステムにより、ユーザーのトレーニング記録から次回の最適化されたプロンプトを自動生成し、継続的に進化するパーソナルトレーニングプログラムを提供

### 1.3 技術スタック推奨
- **フロントエンド**: React Native / Flutter / Swift UI (iOS) + Jetpack Compose (Android)
- **アイコンライブラリ**: Lucide Icons (統一使用)
- **状態管理**: Redux Toolkit / Zustand / Provider
- **アニメーション**: Reanimated / Lottie

---

## 2. デザインシステム

### 2.1 カラーパレット

#### ライトモード
```scss
// Primary Colors
$primary-blue: #3B82F6;      // Blue-500
$primary-purple: #8B5CF6;    // Purple-500

// Status Colors
$success-green: #10B981;     // Green-500
$warning-amber: #F59E0B;     // Amber-500
$error-red: #EF4444;         // Red-500

// Neutral Colors
$gray-50: #F9FAFB;
$gray-100: #F3F4F6;
$gray-200: #E5E7EB;
$gray-300: #D1D5DB;
$gray-400: #9CA3AF;
$gray-500: #6B7280;
$gray-600: #4B5563;
$gray-700: #374151;
$gray-800: #1F2937;
$gray-900: #111827;

// Background
$bg-primary: #F9FAFB;        // Gray-50
$bg-secondary: #FFFFFF;      // White
$bg-tertiary: #F3F4F6;       // Gray-100

// Text
$text-primary: #111827;      // Gray-900
$text-secondary: #4B5563;    // Gray-600
$text-tertiary: #6B7280;     // Gray-500
$text-quaternary: #9CA3AF;   // Gray-400
```

#### ダークモード
```scss
// Background
$dark-bg-primary: #111827;   // Gray-900
$dark-bg-secondary: #1F2937; // Gray-800
$dark-bg-tertiary: #374151;  // Gray-700

// Text
$dark-text-primary: #F9FAFB; // Gray-50
$dark-text-secondary: #D1D5DB; // Gray-300
$dark-text-tertiary: #9CA3AF; // Gray-400

// Status Colors (同じ)
$dark-primary-blue: #60A5FA;  // Blue-400
$dark-success-green: #34D399; // Green-400
```

#### グラデーション
```scss
// Primary Gradient
$gradient-primary: linear-gradient(to right, #3B82F6, #8B5CF6);
$gradient-purple-pink: linear-gradient(to right, #8B5CF6, #EC4899);
$gradient-blue-purple: linear-gradient(135deg, #3B82F6, #8B5CF6);
```

### 2.2 タイポグラフィ

```scss
// Font Family
$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

// Font Sizes & Line Heights
$text-xs: 12px;    // line-height: 16px
$text-sm: 14px;    // line-height: 20px
$text-base: 16px;  // line-height: 24px
$text-lg: 18px;    // line-height: 28px
$text-xl: 20px;    // line-height: 28px
$text-2xl: 24px;   // line-height: 32px

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;

// 使用例
.heading-1 {
  font-size: $text-2xl;
  font-weight: $font-bold;
  line-height: 32px;
}

.body-text {
  font-size: $text-base;
  font-weight: $font-normal;
  line-height: 24px;
}

.caption {
  font-size: $text-sm;
  font-weight: $font-normal;
  line-height: 20px;
}
```

### 2.3 スペーシングシステム

```scss
// 4px基準のスペーシング
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;
$space-12: 48px;
$space-16: 64px;

// パディング標準値
$padding-xs: $space-2;   // 8px
$padding-sm: $space-3;   // 12px
$padding-md: $space-4;   // 16px
$padding-lg: $space-6;   // 24px
$padding-xl: $space-8;   // 32px
```

### 2.4 シャドウ

```scss
// Shadow Definitions
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### 2.5 ボーダー半径

```scss
$rounded-sm: 4px;
$rounded-md: 8px;
$rounded-lg: 12px;
$rounded-xl: 16px;
$rounded-2xl: 24px;
$rounded-full: 9999px;
```

---

## 3. グローバルコンポーネント

### 3.1 ヘッダー

```yaml
Component: AppHeader
Height: 56px
Background: 
  - Light: $bg-secondary with $shadow-sm
  - Dark: $dark-bg-secondary
Padding: horizontal 16px, vertical 12px
Layout: Flexbox, space-between

Contents:
  Left:
    - Logo Icon: 
      - Size: 32x32px
      - Background: $gradient-blue-purple
      - Border Radius: $rounded-lg
      - Icon: Dumbbell (Lucide), 20x20px, white
    - App Name: 
      - Text: "FitLoop"
      - Style: $text-xl, $font-bold
      - Margin Left: 8px
    - Version Badge:
      - Background: Purple-100
      - Text: Purple-700, $text-xs
      - Padding: 2px 8px
      - Border Radius: $rounded-full
      - Margin Left: 8px
      
  Right:
    - Dark Mode Toggle:
      - Size: 40x40px touch target
      - Icon: Sun/Moon (Lucide), 20x20px
      - Background: 
        - Light: Gray-100
        - Dark: Gray-700
      - Border Radius: $rounded-lg
      - Hover: scale(1.05)
      - Transition: all 200ms ease
```

### 3.2 タブバー（Bottom Navigation）

```yaml
Component: TabBar
Height: 64px
Background:
  - Light: $bg-secondary
  - Dark: $dark-bg-secondary
Border Top: 1px solid (Light: Gray-200, Dark: Gray-700)
Position: Fixed bottom
Safe Area: Bottom padding for iPhone X+

Tabs:
  Count: 4
  Layout: Grid, equal width
  
Tab Item:
  Height: 100%
  Padding: vertical 12px
  
  Icon:
    Size: 20x20px
    Color:
      - Active: Blue-500 (Light) / Blue-400 (Dark)
      - Inactive: Gray-500 (Light) / Gray-400 (Dark)
  
  Label:
    Font: $text-xs
    Margin Top: 4px
    Color: Same as icon
  
  Transition: color 300ms ease
  
Icons & Labels:
  1. Home (Lucide) - "プロンプト"
  2. User (Lucide) - "プロフィール"
  3. Library (Lucide) - "ライブラリ"
  4. HelpCircle (Lucide) - "使い方"
```

### 3.3 カード

```yaml
Component: Card
Background:
  - Light: $bg-secondary
  - Dark: $dark-bg-secondary
Border Radius: $rounded-xl (16px)
Shadow: $shadow-sm
Padding: 16px
Margin Bottom: 16px

Hover State:
  Shadow: $shadow-md
  Transform: scale(1.02)
  Transition: all 300ms ease
```

### 3.4 ボタン

#### プライマリボタン
```yaml
Component: PrimaryButton
Height: 48px
Padding: horizontal 16px
Border Radius: $rounded-lg
Background: $primary-blue
Text: White, $text-base, $font-medium
Shadow: $shadow-lg

States:
  Hover:
    Background: Blue-600
    Transform: scale(1.05)
  
  Active:
    Transform: scale(0.98)
  
  Disabled:
    Background: Gray-400
    Cursor: not-allowed

Transition: all 200ms ease
```

#### グラデーションボタン
```yaml
Component: GradientButton
Height: 48px
Background: $gradient-primary or $gradient-purple-pink
Others: Same as PrimaryButton

Hover:
  Background: Darken gradient colors by 10%
```

#### アイコンボタン
```yaml
Component: IconButton
Size: 32x32px (Touch target: 44x44px minimum)
Border Radius: $rounded-lg
Background: transparent
Icon Size: 16x16px

States:
  Default:
    Color: Gray-400
  Hover:
    Color: Blue-500 (or context color)
  Active:
    Color: Blue-600
    Transform: scale(0.95)
```

### 3.5 入力フィールド

```yaml
Component: TextInput
Height: 40px
Padding: horizontal 12px
Border: 1px solid
Border Color:
  - Default: Gray-200 (Light) / Gray-600 (Dark)
  - Focus: Blue-500
Border Radius: $rounded-lg
Background:
  - Light: Gray-50
  - Dark: Gray-700
Text: 
  - Light: Gray-900
  - Dark: White
Placeholder:
  - Light: Gray-500
  - Dark: Gray-400

Focus:
  Outline: none
  Ring: 2px Blue-500
  Transition: all 200ms ease

Label:
  Font: $text-sm
  Color: Gray-600 (Light) / Gray-400 (Dark)
  Margin Bottom: 4px
```

### 3.6 セレクトボックス

```yaml
Component: Select
Height: 40px
Others: Same as TextInput
Icon: ChevronDown (Lucide), 16x16px, right side
```

### 3.7 トグルスイッチ

```yaml
Component: Toggle
Width: 48px
Height: 24px
Border Radius: $rounded-full
Background:
  - Off: Gray-300
  - On: Blue-500
Transition: background 300ms ease

Knob:
  Size: 20x20px
  Background: White
  Shadow: $shadow-md
  Position:
    - Off: translateX(2px)
    - On: translateX(26px)
  Transition: transform 300ms ease
```

---

## 4. 画面別詳細仕様

### 4.1 プロンプトタブ（メイン画面）

#### 4.1.1 緊急アラート
```yaml
Component: CriticalAlert
Condition: Show when bodyStats.trend === 'critical'
Background: Red-50
Border: 1px solid Red-200
Border Radius: $rounded-xl
Padding: 16px
Margin Bottom: 16px

Layout:
  - Icon: AlertCircle (Lucide), 20x20px, Red-500
  - Content:
    - Title: $font-semibold, Red-900
    - Description: $text-sm, Red-700, margin-top 4px
  - Spacing: Icon margin-right 12px
```

#### 4.1.2 メタプロンプト状態カード
```yaml
Component: MetaPromptStatus
Background: Card standard
Padding: 16px

Header:
  - Title: 
    - Icon: Brain (Lucide), 20x20px, Purple-500
    - Text: "メタプロンプト状態", $font-semibold
  - Status:
    - Icon: RefreshCw (Lucide), 16x16px, Green-500
    - Text: "自動進化中", $text-sm, Green-500
    - Animation: Icon rotate 2s linear infinite

Info Grid:
  Columns: 2
  Gap: 16px
  
  Info Box:
    Background: Gray-50 (Light) / Gray-700 (Dark)
    Border Radius: $rounded-lg
    Padding: 12px
    
    Label: $text-sm, Gray-500
    Value: $font-semibold, $text-base

Stats Bar:
  Margin Top: 12px
  Items:
    - Activity Icon + "筋肉量: X%"
    - Target Icon + "体脂肪率: X%"
  Font: $text-sm
  Spacing: 16px between items
```

#### 4.1.3 メタプロンプト表示エリア
```yaml
Component: MetaPromptDisplay
Background: Card standard

Header:
  Icon: Zap (Lucide), 20x20px, Yellow-500
  Title: "生成されたメタプロンプト"

Content Area:
  Background: Gray-50 (Light) / Gray-700 (Dark)
  Border Radius: $rounded-lg
  Padding: 16px
  Max Height: 256px (64 * 4)
  Overflow: scroll
  
  Text:
    Font: $text-sm, monospace
    Line Height: 24px
    White Space: pre-wrap

Action Buttons:
  Margin Top: 16px
  Gap: 12px
  
  Copy Button:
    Flex: 1
    States:
      Default: Blue-500
      Copied: Green-500 (2s duration)
    Icon: Copy/Check (Lucide)
    
  Record Button:
    Background: $gradient-purple-pink
    Icon: RefreshCw (Lucide)
```

#### 4.1.4 トレーニング記録入力フォーム
```yaml
Component: TrainingRecordForm
Background: Card standard
Animation: slideDown 300ms ease-out when opened

Header:
  Border Bottom: 1px solid Gray-200/700
  Padding: 16px
  Icon: Calendar (Lucide), Blue-500

Form Sections:
  Padding: 16px
  Gap: 16px

  Basic Info:
    Grid: 2 columns
    Gap: 16px
    
  Exercise Inputs:
    Each Exercise:
      Label: $text-sm, $font-medium
      Grid: 3 columns
      Gap: 8px
      Margin Bottom: 12px
    
  Submit Button:
    Full Width
    Height: 48px
    Background: $gradient-primary
    
    Loading State:
      Icon: RefreshCw, animate-spin
      Text: "AIが分析中..."
      Disabled: true
      Background: Gray-400
```

#### 4.1.5 AI応答エリア
```yaml
Component: AIResponseArea
Collapsible: true
Default State: collapsed

Header:
  Clickable: entire area
  Hover: Background change
  Icon: Sparkles (Lucide), Purple-500
  Chevron: ChevronUp/Down, animate rotation

Content:
  Animation: slideDown 300ms
  
  Info Box:
    Background: Yellow-50 (Light) / Gray-700 (Dark)
    Icon: Brain, Yellow-600
    Text: $text-sm
    
  Textarea:
    Height: 128px (32 * 4)
    Others: Standard input styling
```

#### 4.1.6 進化履歴
```yaml
Component: EvolutionHistory
Background: Card standard

Header:
  Icon: TrendingUp (Lucide), Green-500
  Title: "プロンプト進化履歴"

History Items:
  Background: Gray-50/700
  Border Radius: $rounded-lg
  Padding: 8px
  Margin Bottom: 8px
  
  Layout:
    - Version: $text-sm
    - Date & Description: $text-xs, Gray-500
  
  Animation: fadeIn with stagger (100ms delay each)
```

### 4.2 プロフィールタブ

#### 4.2.1 折りたたみセクション
```yaml
Component: CollapsibleSection
Background: Card standard
Overflow: hidden

Header:
  Padding: 16px
  Clickable: entire area
  Hover: Background Gray-50/700
  Transition: background 200ms
  
  Title: $font-semibold
  Chevron: Rotation animation 200ms

Content:
  Animation: slideDown 300ms
  Padding: 0 16px 16px 16px
  
Sections:
  1. 基本情報 (default expanded)
  2. 目標設定
  3. 環境設定
```

#### 4.2.2 入力フィールドレイアウト
```yaml
Basic Info Grid:
  - Name & Age: 2 columns
  - Gender, Height, Weight: 3 columns
  - Experience Level: 3 button grid

Goal Setting:
  - Goal Buttons: 2x2 grid
  - Period Select: full width

Environment:
  - Location Buttons: 3 columns
  - Frequency Slider: 
    - Track: Gray-200, height 4px
    - Thumb: White, 20x20px, shadow
    - Labels: space-between
```

#### 4.2.3 AIデータインポートボタン
```yaml
Component: AIImportButton
Height: auto (padding 16px vertical, 24px horizontal)
Background: $gradient-purple-pink
Shadow: $shadow-lg
Hover: 
  Scale: 1.05
  Shadow: $shadow-xl
Transition: all 300ms

Content:
  Icon: Upload (Lucide), 20x20px
  Title: $font-medium
  Subtitle: $text-sm, opacity 0.8, margin-top 4px
```

### 4.3 ライブラリタブ

#### 4.3.1 新規メニュー作成ボタン
```yaml
Component: CreateMenuButton
Height: 48px
Background: $gradient-primary
Shadow: $shadow-md
Hover: scale(1.02), shadow-lg
Icon: Plus (Lucide), 20x20px
```

#### 4.3.2 検索バー
```yaml
Component: SearchBar
Height: 48px
Background: Card standard
Padding: 12px 16px
Icon: Search (Lucide), 20x20px, Gray-400/500
Input: 
  Border: none
  Background: transparent
  Flex: 1
  Margin Left: 12px
```

#### 4.3.3 フィルターボタン
```yaml
Component: FilterButtons
Layout: Horizontal scroll
Padding Bottom: 8px
Gap: 8px

Button:
  Padding: 8px 16px
  Border Radius: $rounded-lg
  White Space: nowrap
  
  States:
    Active: Blue-500 background, white text
    Inactive: Gray-200/800 background
  
  Transition: all 200ms
  
  Special: お気に入りボタンには Star icon
```

#### 4.3.4 メニューカード
```yaml
Component: MenuCard
Background: Card standard
Hover: shadow-md, scale(1.02)
Animation: fadeIn with stagger

Header:
  Title: $font-semibold
  Category Badge:
    Padding: 2px 8px
    Border Radius: $rounded-full
    Font: $text-xs
    Colors:
      上半身: Blue-100/700
      下半身: Green-100/700
      全身: Purple-100/700

Description: $text-sm, Gray-600/400

Action Buttons:
  Size: 32x32px touch target
  Icon Size: 16x16px
  
  Favorite:
    Filled when active: Yellow-500
    Animation: scale bounce on toggle
  
  Copy:
    Success state: Green-500 with Check icon
    Duration: 2s
  
  Delete:
    Hover: Red-500
    Confirmation: Required

Footer:
  Font: $text-sm
  Separator: " • "
```

### 4.4 使い方タブ

#### 4.4.1 メタプロンプト説明カード
```yaml
Component: MetaPromptExplanation
Background: Gradient Purple-100 to Pink-100 (Light mode)
Background: Gradient Purple-900 to Pink-900 (Dark mode)
Padding: 16px
Icon: Brain (Lucide)
Text: $text-sm, line-height 20px
```

#### 4.4.2 使い方ガイド
```yaml
Component: GuideSteps
Background: Card standard

Step Item:
  Layout: Flex horizontal
  Gap: 12px
  Margin Bottom: 16px
  
  Number Circle:
    Size: 32x32px
    Background: Blue-500
    Color: White
    Font: $text-sm, $font-medium
    Flex Shrink: 0
  
  Content:
    Title: $font-medium
    Description: $text-sm, Gray-600/400, margin-top 4px
    
  Link Button (Step 3):
    Color: Blue-500
    Font: $text-sm, $font-medium
    Icon: ExternalLink, 12x12px, margin-left 4px
    Hover: underline
```

#### 4.4.3 機能説明
```yaml
Component: FeatureList
Background: Card standard

Feature Item:
  Layout: Flex horizontal
  Gap: 12px
  Margin Bottom: 12px
  
  Icon:
    Size: 20x20px
    Margin Top: 2px (align with text)
    Colors:
      Brain: Purple-500
      TrendingUp: Green-500
      Target: Blue-500
  
  Content:
    Title: $font-medium
    Description: $text-sm, Gray-600/400, margin-top 4px
```

---

## 5. インタラクション仕様

### 5.1 タップフィードバック
```yaml
Touch Feedback:
  iOS: 
    - UIImpactFeedbackGenerator (medium)
    - タップ時: 0.98 scale
  
  Android:
    - Ripple effect
    - Elevation change
  
  Duration: 100ms
  Easing: ease-out
```

### 5.2 スワイプジェスチャー
```yaml
Tab Switching:
  Enabled: false (タブバーのみ使用)
  
Card Actions:
  Swipe to Delete:
    Threshold: 30% of width
    Background: Red-500
    Icon: Trash2, white
    Confirmation: Required
```

### 5.3 プルトゥリフレッシュ
```yaml
Enabled Screens: Library, Evolution History
Indicator: 
  iOS: UIRefreshControl
  Android: SwipeRefreshLayout
Color: Blue-500
```

### 5.4 キーボード処理
```yaml
Keyboard Avoidance:
  iOS: KeyboardAvoidingView
  Android: windowSoftInputMode="adjustResize"
  
Done Button Action:
  - 次のフィールドへ移動
  - 最後のフィールド: キーボードを閉じる
```

---

## 6. 状態管理仕様

### 6.1 グローバル状態
```typescript
interface AppState {
  // UI State
  activeTab: 'prompt' | 'profile' | 'library' | 'help';
  darkMode: boolean;
  
  // Meta Prompt State
  promptVersion: number;
  nextSession: number;
  currentBodyStats: {
    musclePercentage: number;
    fatPercentage: number;
    weight: number;
    trend: 'improving' | 'stable' | 'declining' | 'critical';
  };
  
  // User Profile
  profile: {
    basic: {
      name: string;
      age: number;
      gender: 'male' | 'female' | 'other';
      height: number;
      weight: number;
      experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    };
    goals: {
      primaryGoal: 'strength' | 'weight_loss' | 'endurance' | 'muscle_gain';
      deadline: '1month' | '3months' | '6months' | '1year';
    };
    environment: {
      location: 'gym' | 'home' | 'outdoor';
      frequency: number; // 1-7
    };
  };
  
  // Training Records
  trainingRecords: TrainingRecord[];
  
  // Saved Menus
  savedMenus: Menu[];
}
```

### 6.2 ローカル状態
```typescript
// Per Component Local State
interface ComponentState {
  // Prompt Tab
  copiedPrompt: boolean;
  showAIResponse: boolean;
  showRecordInput: boolean;
  isAnalyzing: boolean;
  pastedResponse: string;
  
  // Profile Tab
  profileExpanded: {
    basic: boolean;
    goals: boolean;
    environment: boolean;
  };
  
  // Library Tab
  filterType: 'all' | 'upper' | 'lower' | 'full' | 'favorite';
  searchQuery: string;
  copiedMenuId: number | null;
}
```

### 6.3 永続化
```yaml
Persisted Data:
  - darkMode preference
  - profile information
  - training records (last 100)
  - saved menus
  - prompt version history

Storage:
  iOS: UserDefaults + Core Data
  Android: SharedPreferences + Room
  Web: LocalStorage + IndexedDB
```

---

## 7. アニメーション仕様

### 7.1 基本アニメーション
```scss
// Fade In
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Slide Down
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px; // 十分な高さ
  }
}

// Pulse
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// Spin
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 7.2 タイミング関数
```scss
$ease-out: cubic-bezier(0, 0, 0.2, 1);
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
$spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### 7.3 画面遷移
```yaml
Tab Switch:
  Type: Fade
  Duration: 200ms
  Easing: ease-out

Modal/Sheet:
  Type: Slide up
  Duration: 300ms
  Easing: ease-out
  Backdrop: Fade in, opacity 0.5
```

### 7.4 マイクロインタラクション
```yaml
Button Press:
  Scale: 0.98
  Duration: 100ms

Toggle Switch:
  Knob Movement: 300ms, ease-out
  Background Color: 300ms, ease-out

Progress Updates:
  Type: Animated counter
  Duration: 1000ms
  Easing: ease-in-out

Card Hover/Press:
  Scale: 1.02
  Shadow: Increase
  Duration: 200ms
```

---

## 8. レスポンシブ対応

### 8.1 ブレークポイント
```scss
$breakpoint-sm: 375px;  // iPhone SE
$breakpoint-md: 414px;  // iPhone Plus
$breakpoint-lg: 768px;  // iPad
$breakpoint-xl: 1024px; // iPad Pro
```

### 8.2 セーフエリア
```yaml
iOS:
  Top: Safe area inset top
  Bottom: Safe area inset bottom + tab bar height
  
Android:
  Status Bar: Translucent
  Navigation Bar: Color match with tab bar
```

### 8.3 タブレット対応
```yaml
iPad Layout:
  Max Width: 768px centered
  Side Padding: 32px
  
  Grid Adjustments:
    - Profile inputs: 3-4 columns
    - Menu cards: 2 columns
    - Larger touch targets
```

---

## 9. アクセシビリティ

### 9.1 コントラスト比
```yaml
Text Contrast:
  - Normal Text: 4.5:1 minimum
  - Large Text: 3:1 minimum
  - Interactive Elements: 3:1 minimum

Color Blind Safe:
  - Don't rely solely on color
  - Use icons + text
  - Pattern differentiation
```

### 9.2 VoiceOver / TalkBack
```yaml
Labels:
  - All interactive elements
  - Image descriptions
  - State announcements
  
Hints:
  - Complex interactions
  - Gesture instructions
  
Traits:
  - Button, Link, Header
  - Selected, Disabled states
```

### 9.3 動作設定
```yaml
Reduce Motion:
  - Disable parallax
  - Instant transitions
  - No auto-playing animations

Larger Text:
  - Support Dynamic Type (iOS)
  - Scale up to 200%
  - Maintain layout integrity
```

### 9.4 キーボードナビゲーション
```yaml
Tab Order:
  Logical flow through UI
  Skip links for main content
  
Focus Indicators:
  Ring: 2px Blue-500
  Offset: 2px
  
Keyboard Shortcuts:
  - Tab: Next element
  - Shift+Tab: Previous
  - Enter/Space: Activate
  - Escape: Close modal
```

---

## 10. パフォーマンス要件

### 10.1 起動時間
```yaml
Cold Start:
  Target: < 2.0s
  Max: 3.0s
  
Warm Start:
  Target: < 0.5s
  Max: 1.0s
```

### 10.2 アニメーション
```yaml
Frame Rate:
  Target: 60 FPS
  Minimum: 30 FPS
  
Jank Prevention:
  - Use native driver
  - GPU acceleration
  - Avoid layout thrashing
```

### 10.3 メモリ使用量
```yaml
Target:
  iOS: < 150MB
  Android: < 100MB
  
Image Optimization:
  - WebP format
  - Multiple resolutions
  - Lazy loading
```

### 10.4 ネットワーク
```yaml
Offline Support:
  - Core features available
  - Queue sync operations
  - Clear offline indicators
  
API Calls:
  - Timeout: 10s
  - Retry: 3 times
  - Exponential backoff
```

### 10.5 バッテリー
```yaml
Optimization:
  - Minimize background activity
  - Batch network requests
  - Reduce animation when low battery
```

---

## 付録A: アイコン一覧

| 機能 | アイコン名 (Lucide) | サイズ | 使用箇所 |
|------|-------------------|--------|----------|
| アプリロゴ | Dumbbell | 20x20 | ヘッダー |
| ホーム | Home | 20x20 | タブバー |
| プロフィール | User | 20x20 | タブバー |
| ライブラリ | Library | 20x20 | タブバー |
| ヘルプ | HelpCircle | 20x20 | タブバー |
| ダークモード | Sun/Moon | 20x20 | ヘッダー |
| コピー | Copy | 20x20 | ボタン |
| チェック | Check | 20x20 | 完了状態 |
| 削除 | Trash2 | 16x16 | アクション |
| お気に入り | Star | 16x16 | アクション |
| 検索 | Search | 20x20 | 検索バー |
| 追加 | Plus | 20x20 | 新規作成 |
| アップロード | Upload | 20x20 | インポート |
| 更新 | RefreshCw | 16-20x20 | 各種 |
| 分析 | Brain | 20x20 | メタプロンプト |
| 統計 | TrendingUp | 20x20 | 進化履歴 |
| ターゲット | Target | 16x16 | 目標 |
| アクティビティ | Activity | 16x16 | 筋肉量 |
| アラート | AlertCircle | 20x20 | 警告 |
| 稲妻 | Zap | 20x20 | メタプロンプト |
| キラキラ | Sparkles | 20x20 | AI |
| カレンダー | Calendar | 20x20 | 記録入力 |
| 外部リンク | ExternalLink | 12x12 | リンク |
| 上矢印 | ChevronUp | 20x20 | 折りたたみ |
| 下矢印 | ChevronDown | 20x20 | 折りたたみ |

---

## 付録B: エラー状態

### ネットワークエラー
```yaml
Display:
  Icon: WifiOff (Lucide)
  Title: "接続エラー"
  Message: "インターネット接続を確認してください"
  Action: "再試行" button
```

### 入力検証エラー
```yaml
Display:
  Border: Red-500
  Message: Below field, Red-500, $text-sm
  Icon: AlertCircle, 12x12, inline
```

### 空状態
```yaml
Library Empty:
  Icon: Library (Lucide), 48x48, Gray-300
  Message: "メニューがまだありません"
  Action: "新規作成" button
```

---

## 付録C: 実装優先順位

### Phase 1 (MVP)
1. 基本的なUIフレームワーク
2. タブナビゲーション
3. メタプロンプト表示・コピー
4. プロフィール基本機能
5. ダークモード

### Phase 2
1. トレーニング記録入力
2. AI分析シミュレーション
3. ライブラリ機能
4. 検索・フィルター

### Phase 3
1. 実際のAI連携
2. データ同期
3. 高度なアニメーション
4. アクセシビリティ完全対応

---

**改訂履歴**
- v1.0.0 (2024-06-06): 初版作成
- 作成者: FitLoop UIデザインチーム

この仕様書は、FitLoopアプリの完全な実装を可能にする詳細な設計ドキュメントです。各要素のピクセル単位の仕様、色、アニメーション、インタラクションが網羅されており、iOS/Androidエンジニアが一貫性のある高品質なアプリを開発できるようになっています。