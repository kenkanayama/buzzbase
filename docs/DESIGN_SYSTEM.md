# 🎨 BuzzBase デザインシステム

このドキュメントは BuzzBase のフロントエンド開発における UI/UX の一貫性を保つためのガイドラインです。

---

## 📋 目次

1. [デザイン原則](#デザイン原則)
2. [カラーパレット](#カラーパレット)
3. [タイポグラフィ](#タイポグラフィ)
4. [スペーシング](#スペーシング)
5. [コンポーネント](#コンポーネント)
6. [アイコン](#アイコン)
7. [シャドウ・エフェクト](#シャドウエフェクト)
8. [レスポンシブデザイン](#レスポンシブデザイン)
9. [アニメーション](#アニメーション)

---

## デザイン原則

### ブランドイメージ

BuzzBase は **「硬めとポップの中間」** を意識したデザインを採用しています。

| 特徴 | 説明 |
|------|------|
| **クリーン** | 白背景を基調とした清潔感のあるデザイン |
| **信頼感** | 整然としたレイアウトとシンプルな装飾 |
| **活力** | オレンジ・レッドのアクセントカラーでエネルギーを表現 |
| **親しみやすさ** | 丸みを帯びた角、適度なスペーシング |

### デザイン方針

- ✅ **フラットデザイン**: グラデーションは使用しない
- ✅ **ホワイトベース**: 背景は白（`#ffffff`）または淡いグレー（`#fafafa`）
- ✅ **アクセントカラー**: オレンジとレッドをポイント使い
- ✅ **シンプル**: 装飾は最小限、コンテンツを引き立てる
- ❌ **ダークテーマ**: 使用しない
- ❌ **グラデーション**: 使用しない
- ❌ **glassmorphism**: 使用しない

---

## カラーパレット

### プライマリカラー（オレンジ）

メインアクション、ブランドアイデンティティに使用

| 名前 | HEX | 用途 |
|------|-----|------|
| Primary Light | `#fff8ed` | ハイライト背景、バッジ背景 |
| Primary 100 | `#ffefd4` | アイコンボックス背景 |
| Primary Border | `#ffdba8` | ボーダー、ホバー状態 |
| **Primary (メイン)** | `#f29801` | **ボタン、リンク、ロゴ** |
| Primary Hover | `#e38500` | ホバー状態 |
| Primary Active | `#bc6502` | アクティブ状態 |

```tsx
// 使用例（インラインスタイル）
<button style={{ backgroundColor: '#f29801', color: 'white' }}>
  登録する
</button>

<span style={{ color: '#f29801' }}>強調テキスト</span>
```

### セカンダリカラー（レッド）

注意喚起、セカンダリアクセント、数値ハイライトに使用

| 名前 | HEX | 用途 |
|------|-----|------|
| Secondary Light | `#fff1f0` | ハイライト背景 |
| Secondary 100 | `#ffe1df` | アイコンボックス背景 |
| Secondary Border | `#ffc8c4` | ボーダー |
| **Secondary (メイン)** | `#e61f13` | **警告、削除、数値強調** |
| Secondary Hover | `#d41108` | ホバー状態 |
| Secondary Active | `#b00d06` | アクティブ状態 |

```tsx
// 使用例
<span style={{ color: '#e61f13' }}>15.2K</span> // 再生数などの数値

<button style={{ backgroundColor: '#e61f13', color: 'white' }}>
  削除する
</button>
```

### ニュートラルカラー（グレー）

テキスト、背景、ボーダーに使用

| 名前 | HEX | 用途 |
|------|-----|------|
| Neutral 50 | `#fafafa` | セクション背景 |
| Neutral 100 | `#f5f5f5` | カード背景（ホバー） |
| Neutral 200 | `#e5e5e5` | ボーダー |
| Neutral 400 | `#a3a3a3` | プレースホルダー |
| Neutral 500 | `#737373` | セカンダリテキスト |
| Neutral 600 | `#525252` | 本文テキスト |
| Neutral 800 | `#262626` | 強調テキスト |
| Neutral 900 | `#171717` | 見出し |

### カラー定数（TypeScript）

```typescript
// constants/colors.ts
export const COLORS = {
  // Primary (Orange)
  primary: '#f29801',
  primaryHover: '#e38500',
  primaryLight: '#fff8ed',
  primaryBorder: '#ffdba8',
  
  // Secondary (Red)
  secondary: '#e61f13',
  secondaryLight: '#fff1f0',
  secondaryBorder: '#ffc8c4',
  
  // Neutral
  neutral50: '#fafafa',
  neutral100: '#f5f5f5',
  neutral200: '#e5e5e5',
  neutral400: '#a3a3a3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral800: '#262626',
  neutral900: '#171717',
};
```

---

## タイポグラフィ

### フォントファミリー

```css
/* 本文 */
font-family: "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;

/* 見出し・ブランド */
font-family: "DM Sans", "Noto Sans JP", sans-serif;
```

### フォントサイズ

| クラス | サイズ | 用途 |
|--------|--------|------|
| `text-xs` | 12px | キャプション、ラベル |
| `text-sm` | 14px | 補足テキスト、ボタン（小） |
| `text-base` | 16px | 本文 |
| `text-lg` | 18px | リード文 |
| `text-xl` | 20px | サブ見出し |
| `text-2xl` | 24px | セクション見出し |
| `text-3xl` | 30px | ページタイトル |
| `text-4xl` | 36px | ヒーロー見出し（モバイル） |
| `text-5xl` | 48px | ヒーロー見出し（タブレット） |
| `text-6xl` | 60px | ヒーロー見出し（デスクトップ） |

### フォントウェイト

| クラス | 用途 |
|--------|------|
| `font-normal` | 本文 |
| `font-medium` | ナビゲーション、ラベル |
| `font-semibold` | ボタン、小見出し |
| `font-bold` | 見出し、強調 |

---

## スペーシング

### 基本単位

Tailwind CSS の標準スペーシングスケールを使用（1単位 = 4px）

| クラス | サイズ | 用途 |
|--------|--------|------|
| `p-4` / `m-4` | 16px | コンポーネント内パディング |
| `p-6` / `m-6` | 24px | カード内パディング |
| `gap-4` | 16px | 要素間の標準ギャップ |
| `gap-6` | 24px | セクション内のギャップ |
| `gap-8` | 32px | 大きなセクション間ギャップ |

### セクションスペーシング

```tsx
// セクション間の余白
<section className="py-20 md:py-28 px-4">
  ...
</section>
```

---

## コンポーネント

### Button

```tsx
// プライマリボタン
<button
  className="px-8 py-4 text-lg font-semibold text-white rounded-lg transition-colors"
  style={{ backgroundColor: '#f29801' }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e38500'}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f29801'}
>
  無料で始める
</button>

// セカンダリボタン
<button
  className="px-5 py-2 text-sm font-medium rounded-lg border transition-colors"
  style={{ color: '#525252', borderColor: '#e5e5e5' }}
>
  キャンセル
</button>
```

### カード

```tsx
// 標準カード
<div
  className="bg-white border rounded-2xl p-6"
  style={{ 
    borderColor: '#e5e5e5', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
  }}
>
  ...
</div>

// ホバーエフェクト付きカード
<div
  className="bg-white border rounded-2xl p-6 transition-all hover:-translate-y-1"
  style={{ borderColor: '#e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
  onMouseOver={(e) => {
    e.currentTarget.style.borderColor = '#ffdba8';
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.borderColor = '#e5e5e5';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  }}
>
  ...
</div>
```

### バッジ

```tsx
// プライマリバッジ
<span
  className="px-3 py-1 text-xs font-semibold rounded-full border"
  style={{
    color: '#e38500',
    backgroundColor: '#fff8ed',
    borderColor: '#ffdba8',
  }}
>
  計測完了
</span>
```

### アイコンボックス

```tsx
// プライマリカラー
<div
  className="w-12 h-12 rounded-xl flex items-center justify-center"
  style={{ backgroundColor: '#ffefd4' }}
>
  <TrendingUp className="w-6 h-6" style={{ color: '#f29801' }} />
</div>

// セカンダリカラー
<div
  className="w-12 h-12 rounded-xl flex items-center justify-center"
  style={{ backgroundColor: '#ffe1df' }}
>
  <Zap className="w-6 h-6" style={{ color: '#e61f13' }} />
</div>
```

---

## アイコン

### ライブラリ

`lucide-react` を使用

```tsx
import { Zap, TrendingUp, Shield, ChevronRight } from 'lucide-react';

// 使用例
<Zap className="w-5 h-5" style={{ color: '#f29801' }} />
```

### アイコンサイズ

| サイズ | クラス | 用途 |
|--------|--------|------|
| 16px | `w-4 h-4` | インラインアイコン |
| 20px | `w-5 h-5` | ボタン内アイコン |
| 24px | `w-6 h-6` | カード内アイコン |
| 32px | `w-8 h-8` | 大きなアイコン |

---

## シャドウ・エフェクト

### シャドウ

| 名前 | CSS | 用途 |
|------|-----|------|
| Card Shadow | `0 2px 8px rgba(0,0,0,0.08)` | カード、フローティング要素 |
| Card Hover Shadow | `0 4px 16px rgba(0,0,0,0.12)` | カードのホバー状態 |
| Button Shadow | `0 2px 4px rgba(0,0,0,0.1)` | ボタン |

### 角丸

| クラス | サイズ | 用途 |
|--------|--------|------|
| `rounded-lg` | 8px | ボタン、入力フィールド |
| `rounded-xl` | 12px | アイコンボックス |
| `rounded-2xl` | 16px | カード |
| `rounded-full` | 完全な円 | アバター、バッジ |

---

## レスポンシブデザイン

### ブレークポイント

| プレフィックス | 最小幅 | 主な対象デバイス |
|---------------|--------|-----------------|
| (なし) | 0px | モバイル（デフォルト） |
| `sm:` | 640px | 大きめのモバイル |
| `md:` | 768px | タブレット |
| `lg:` | 1024px | デスクトップ |
| `xl:` | 1280px | 大画面 |

### レスポンシブパターン

```tsx
// テキストサイズ
<h1 className="text-4xl sm:text-5xl md:text-6xl">
  見出し
</h1>

// グリッドレイアウト
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  ...
</div>

// セクションパディング
<section className="py-16 md:py-24 px-4">
  ...
</section>

// 表示・非表示
<nav className="hidden md:flex">...</nav>
```

---

## アニメーション

### Tailwind CSSアニメーション

| クラス | 効果 |
|--------|------|
| `animate-fade-in` | フェードイン（0.5秒） |
| `animate-slide-up` | 下から上にスライド（0.5秒） |

### 使用例

```tsx
// 順次アニメーション
<div className="animate-fade-in">1番目</div>
<div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>2番目</div>
<div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>3番目</div>
```

### トランジション

```tsx
// 標準トランジション
<button className="transition-colors">
  ホバーで色が変わる
</button>

// 複合トランジション
<div className="transition-all hover:-translate-y-1">
  ホバーで影と位置が変わる
</div>
```

---

## ✅ チェックリスト

新しいコンポーネントを作成する際は、以下を確認してください：

- [ ] 背景色は `#ffffff`（白）または `#fafafa`（淡いグレー）を使用している
- [ ] プライマリカラーは `#f29801` を使用している
- [ ] セカンダリカラーは `#e61f13` を使用している
- [ ] テキストカラーはニュートラルカラーを使用している
- [ ] **グラデーションを使用していない**
- [ ] 適切な角丸を使用している（`rounded-lg` 以上）
- [ ] シャドウは定義済みの値を使用している
- [ ] レスポンシブ対応している（モバイルファースト）
- [ ] ホバー・トランジションが設定されている

---

## 📚 参考

- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)
