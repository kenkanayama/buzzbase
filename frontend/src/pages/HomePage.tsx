import { Link } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  Shield,
  ChevronRight,
  Link2,
  Calendar,
  BarChart3,
  Smartphone,
  History,
  Check,
} from 'lucide-react';

// =====================================================
// BuzzBase トップページ
// デザイン: ホワイトベース + オレンジ(#f29801)/レッド(#e61f13)アクセント
// =====================================================

// カラー定数
const COLORS = {
  primary: '#f29801',
  primaryHover: '#e38500',
  primaryLight: '#fff8ed',
  primaryBorder: '#ffdba8',
  secondary: '#e61f13',
  secondaryLight: '#fff1f0',
  secondaryBorder: '#ffc8c4',
  neutral50: '#fafafa',
  neutral100: '#f5f5f5',
  neutral200: '#e5e5e5',
  neutral400: '#a3a3a3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral800: '#262626',
  neutral900: '#171717',
};

export function HomePage() {
  return (
    <div className="min-h-screen bg-white" style={{ color: COLORS.neutral800 }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-50 border-b bg-white"
        style={{ borderColor: COLORS.neutral200 }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* ロゴ */}
          <div className="flex items-center">
            <img src="/logo-vertical.png" alt="BuzzBase" className="h-9 w-auto" />
          </div>

          {/* ナビゲーション */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#features"
              className="transition-colors"
              style={{ color: COLORS.neutral600 }}
              onMouseOver={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseOut={(e) => (e.currentTarget.style.color = COLORS.neutral600)}
            >
              機能
            </a>
            <a
              href="#how-it-works"
              className="transition-colors"
              style={{ color: COLORS.neutral600 }}
              onMouseOver={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseOut={(e) => (e.currentTarget.style.color = COLORS.neutral600)}
            >
              使い方
            </a>
          </nav>

          {/* ログインボタン */}
          <Link to="/login">
            <button
              className="rounded-lg border px-5 py-2 text-sm font-medium transition-colors"
              style={{ color: COLORS.neutral600, borderColor: COLORS.neutral200 }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = COLORS.neutral200;
                e.currentTarget.style.color = COLORS.neutral600;
              }}
            >
              ログイン
            </button>
          </Link>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* バッジ */}
          <div
            className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border px-4 py-2"
            style={{
              backgroundColor: COLORS.primaryLight,
              borderColor: COLORS.primaryBorder,
            }}
          >
            <Zap className="h-4 w-4" style={{ color: COLORS.primary }} />
            <span className="text-sm font-medium" style={{ color: COLORS.primaryHover }}>
              インフルエンサー専用ツール
            </span>
          </div>

          {/* メインコピー */}
          <h1 className="mb-6 animate-slide-up font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            <span style={{ color: COLORS.neutral900 }}>PR投稿の</span>
            <span style={{ color: COLORS.secondary }}>再生数</span>
            <br />
            <span style={{ color: COLORS.neutral900 }}>を自動で記録</span>
          </h1>

          {/* サブコピー */}
          <p
            className="mx-auto mb-10 max-w-xl animate-slide-up text-lg"
            style={{ color: COLORS.neutral600, animationDelay: '0.1s' }}
          >
            商品PRの投稿URLを登録するだけ。
            <br className="hidden sm:block" />
            <span className="font-semibold" style={{ color: COLORS.primary }}>
              7日間
            </span>
            のインサイトデータを毎日自動取得して可視化します。
          </p>

          {/* CTA */}
          <div
            className="flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: '0.2s' }}
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <button
                className="group flex w-full items-center justify-center gap-1 rounded-lg px-8 py-4 text-lg font-semibold text-white transition-colors sm:w-auto"
                style={{
                  backgroundColor: COLORS.primary,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryHover)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
              >
                無料で始める
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <button
                className="w-full px-6 py-3.5 font-medium transition-colors sm:w-auto"
                style={{ color: COLORS.neutral600 }}
                onMouseOver={(e) => (e.currentTarget.style.color = COLORS.primary)}
                onMouseOut={(e) => (e.currentTarget.style.color = COLORS.neutral600)}
              >
                使い方を見る
              </button>
            </a>
          </div>

          {/* 対応SNS */}
          <div
            className="mt-12 flex animate-fade-in items-center justify-center gap-4"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="text-sm" style={{ color: COLORS.neutral400 }}>
              対応SNS:
            </span>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white"
                style={{ borderColor: COLORS.neutral200, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: COLORS.neutral600 }}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              {/* TikTok */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white"
                style={{ borderColor: COLORS.neutral200, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: COLORS.neutral600 }}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* イメージカード */}
        <div
          className="mx-auto mt-16 max-w-sm animate-slide-up px-4"
          style={{ animationDelay: '0.3s' }}
        >
          <div
            className="rounded-2xl border bg-white p-5"
            style={{ borderColor: COLORS.neutral200, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            {/* ヘッダー */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: COLORS.neutral100 }}
                >
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: COLORS.neutral800 }}>
                    @your_account
                  </p>
                  <p className="text-xs" style={{ color: COLORS.neutral500 }}>
                    Instagram
                  </p>
                </div>
              </div>
              <span
                className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                style={{
                  color: COLORS.primaryHover,
                  backgroundColor: COLORS.primaryLight,
                  borderColor: COLORS.primaryBorder,
                }}
              >
                計測完了
              </span>
            </div>

            {/* サムネイル */}
            <div
              className="mb-4 flex aspect-video items-center justify-center rounded-xl border"
              style={{ backgroundColor: COLORS.neutral100, borderColor: COLORS.neutral200 }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border bg-white"
                style={{ borderColor: COLORS.neutral200, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              >
                <svg
                  className="ml-0.5 h-5 w-5"
                  style={{ color: COLORS.secondary }}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* 結果 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs" style={{ color: COLORS.neutral500 }}>
                  計測完了時の再生数
                </p>
                <p className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                  15.2K
                </p>
              </div>
              <div
                className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: COLORS.primary }}
              >
                <TrendingUp className="h-4 w-4" />
                <span>+23%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section
        id="how-it-works"
        className="px-4 py-20 md:py-28"
        style={{ backgroundColor: COLORS.neutral50 }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <span
              className="mb-3 block text-sm font-semibold uppercase tracking-wide"
              style={{ color: COLORS.primary }}
            >
              How it works
            </span>
            <h2
              className="mb-4 font-display text-3xl font-bold md:text-4xl"
              style={{ color: COLORS.neutral900 }}
            >
              かんたん<span style={{ color: COLORS.secondary }}>3</span>ステップ
            </h2>
            <p className="mx-auto max-w-md" style={{ color: COLORS.neutral600 }}>
              アカウント登録から再生数の確認まで、シンプルな操作で完結します
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* コネクターライン */}
                {index < steps.length - 1 && (
                  <div
                    className="absolute left-[60%] top-10 hidden h-0.5 w-[80%] border-t-2 border-dashed md:block"
                    style={{ borderColor: COLORS.neutral200 }}
                  />
                )}

                <div
                  className="relative rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md"
                  style={{
                    borderColor: COLORS.neutral200,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* アイコン */}
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: COLORS.primary,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <step.icon className="h-6 w-6 text-white" />
                  </div>

                  <div
                    className="mb-2 text-xs font-bold uppercase tracking-wide"
                    style={{ color: COLORS.primary }}
                  >
                    Step {index + 1}
                  </div>
                  <h3 className="mb-2 text-lg font-bold" style={{ color: COLORS.neutral900 }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: COLORS.neutral600 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="bg-white px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <span
              className="mb-3 block text-sm font-semibold uppercase tracking-wide"
              style={{ color: COLORS.primary }}
            >
              Features
            </span>
            <h2
              className="mb-4 font-display text-3xl font-bold md:text-4xl"
              style={{ color: COLORS.neutral900 }}
            >
              BuzzBaseの特徴
            </h2>
            <p className="mx-auto max-w-md" style={{ color: COLORS.neutral600 }}>
              インフルエンサーの活動をサポートする機能を揃えています
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-white p-6 transition-all hover:-translate-y-1"
                style={{
                  borderColor: COLORS.neutral200,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = COLORS.primaryBorder;
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = COLORS.neutral200;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon className="h-6 w-6" style={{ color: feature.iconColor }} />
                </div>
                <h3 className="mb-2 font-bold" style={{ color: COLORS.neutral900 }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.neutral600 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="px-4 py-20 md:py-28" style={{ backgroundColor: COLORS.neutral50 }}>
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-2xl border bg-white p-8 text-center md:p-12"
            style={{ borderColor: COLORS.neutral200, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            {/* チェックマーク */}
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: '#ffefd4' }}
            >
              <Check className="h-8 w-8" style={{ color: COLORS.primary }} />
            </div>

            <h2
              className="mb-4 font-display text-2xl font-bold md:text-3xl"
              style={{ color: COLORS.neutral900 }}
            >
              さっそく始めてみませんか？
            </h2>
            <p className="mx-auto mb-8 max-w-md" style={{ color: COLORS.neutral600 }}>
              アカウント登録は無料。
              <br />
              今すぐPR投稿の再生数をトラッキングしましょう。
            </p>
            <Link to="/signup">
              <button
                className="mx-auto flex items-center justify-center gap-1 rounded-lg px-8 py-4 text-lg font-semibold text-white transition-colors"
                style={{
                  backgroundColor: COLORS.primary,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.primaryHover)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
              >
                無料で始める
                <ChevronRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t bg-white px-4 py-12" style={{ borderColor: COLORS.neutral200 }}>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* ロゴ */}
            <div className="flex items-center">
              <img src="/logo-vertical.png" alt="BuzzBase" className="h-8 w-auto" />
            </div>

            {/* リンク */}
            <div className="flex items-center gap-6 text-sm" style={{ color: COLORS.neutral500 }}>
              <a
                href="#"
                className="transition-colors"
                onMouseOver={(e) => (e.currentTarget.style.color = COLORS.primary)}
                onMouseOut={(e) => (e.currentTarget.style.color = COLORS.neutral500)}
              >
                利用規約
              </a>
              <a
                href="https://muscatgroup.co.jp/policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                onMouseOver={(e) => (e.currentTarget.style.color = COLORS.primary)}
                onMouseOut={(e) => (e.currentTarget.style.color = COLORS.neutral500)}
              >
                プライバシーポリシー
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfguUNAvmG2Px_ez47Pph0sFXkqbEcMV8RdRM98lhOAotCOOg/viewform?usp=sharing&ouid=106448838806099721900"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                onMouseOver={(e) => (e.currentTarget.style.color = COLORS.primary)}
                onMouseOut={(e) => (e.currentTarget.style.color = COLORS.neutral500)}
              >
                お問い合わせ
              </a>
            </div>

            {/* コピーライト */}
            <p className="text-sm" style={{ color: COLORS.neutral400 }}>
              © {new Date().getFullYear()} BuzzBase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// =====================================================
// 使い方ステップ
// =====================================================
const steps = [
  {
    title: 'URLを登録',
    description: 'InstagramやTikTokの商品PR投稿のURLを登録するだけ。',
    icon: Link2,
  },
  {
    title: '毎日自動更新',
    description: '登録後すぐにデータを取得。7日間毎日自動で更新されます。',
    icon: Calendar,
  },
  {
    title: '結果を確認',
    description: 'ダッシュボードで再生数を確認。過去の投稿と比較もできます。',
    icon: BarChart3,
  },
];

// =====================================================
// 機能リスト
// =====================================================
const features = [
  {
    title: '自動トラッキング',
    description: 'URLを登録すれば、7日間毎日インサイトデータを自動取得。手作業は不要です。',
    icon: TrendingUp,
    bgColor: '#ffefd4', // primary-100
    iconColor: '#f29801', // primary
  },
  {
    title: 'マルチSNS対応',
    description: 'InstagramとTikTokに対応。今後も対応SNSを拡大予定。',
    icon: Zap,
    bgColor: '#ffe1df', // secondary-100
    iconColor: '#e61f13', // secondary
  },
  {
    title: 'セキュア認証',
    description: 'GoogleアカウントまたはメールでSSO。安心のセキュリティ。',
    icon: Shield,
    bgColor: '#ffefd4',
    iconColor: '#f29801',
  },
  {
    title: 'スマホ最適化',
    description: 'スマホでもPCでも使いやすいレスポンシブデザイン。',
    icon: Smartphone,
    bgColor: '#ffe1df',
    iconColor: '#e61f13',
  },
  {
    title: '投稿履歴管理',
    description: '過去のPR投稿をすべて一覧で確認。成長を可視化。',
    icon: History,
    bgColor: '#ffefd4',
    iconColor: '#f29801',
  },
  {
    title: '完全無料',
    description: 'すべての機能を無料でご利用いただけます。',
    icon: Check,
    bgColor: '#ffe1df',
    iconColor: '#e61f13',
  },
];
