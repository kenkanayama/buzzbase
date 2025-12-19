import { Link } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  Shield,
  ChevronRight,
  Link2,
  Calendar,
  BarChart3,
  Instagram,
  Play,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-brand-500/30">
      {/* 背景グラデーション */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[100px]" />
        <div className="absolute left-0 top-1/2 h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-[80px]" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10">
        {/* ヘッダー */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                バズ<span className="text-brand-400">ベース</span>
              </span>
            </div>

            <nav className="hidden items-center gap-6 text-sm md:flex">
              <a href="#features" className="text-gray-400 transition-colors hover:text-white">
                機能
              </a>
              <a href="#how-it-works" className="text-gray-400 transition-colors hover:text-white">
                使い方
              </a>
            </nav>

            <Link to="/login">
              <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15">
                ログイン
              </button>
            </Link>
          </div>
        </header>

        {/* ヒーローセクション */}
        <section className="px-4 pb-20 pt-12 md:pb-32 md:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* バッジ */}
            <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-brand-500/20 to-purple-500/20 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
              </span>
              <span className="text-sm text-gray-300">インフルエンサー専用ツール</span>
            </div>

            {/* メインコピー */}
            <h1 className="mb-6 animate-slide-up font-display text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl">
              <span className="text-white">PR投稿の</span>
              <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-brand-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                再生数
              </span>
              <br />
              <span className="text-white">を自動で記録</span>
            </h1>

            {/* サブコピー */}
            <p
              className="mx-auto mb-10 max-w-xl animate-slide-up text-base text-gray-400 sm:text-lg"
              style={{ animationDelay: '0.1s' }}
            >
              商品PRの投稿URLを登録するだけ。
              <br className="hidden sm:block" />
              <span className="font-medium text-brand-400">7日後</span>
              の再生数を自動取得して可視化します。
            </p>

            {/* CTA */}
            <div
              className="flex animate-slide-up flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: '0.2s' }}
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full sm:w-auto">
                  無料で始める
                  <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3.5 font-medium text-gray-300 transition-colors hover:text-white sm:w-auto">
                  使い方を見る
                </button>
              </a>
            </div>

            {/* SNSアイコン */}
            <div
              className="mt-12 flex animate-fade-in items-center justify-center gap-4"
              style={{ animationDelay: '0.4s' }}
            >
              <span className="text-xs text-gray-500">対応SNS:</span>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* モックアップカード */}
          <div
            className="mx-auto mt-16 max-w-sm animate-slide-up px-4"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative">
              {/* グロー効果 */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/50 via-purple-500/50 to-pink-500/50 opacity-50 blur-xl" />

              {/* カード */}
              <div className="relative rounded-3xl border border-white/10 bg-gray-900/90 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400" />
                    <div>
                      <p className="text-sm font-medium">@your_account</p>
                      <p className="text-xs text-gray-500">Instagram</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400">
                    計測完了
                  </span>
                </div>

                <div className="mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                    <Play className="ml-0.5 h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">7日後の再生数</p>
                    <p className="text-2xl font-bold text-white">
                      <span className="bg-gradient-to-r from-brand-400 to-pink-400 bg-clip-text text-transparent">
                        15.2K
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">+23%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section
          id="how-it-works"
          className="bg-gradient-to-b from-transparent via-gray-900/50 to-transparent px-4 py-20 md:py-32"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <span className="mb-3 block text-sm font-medium text-brand-400">HOW IT WORKS</span>
              <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
                かんたん<span className="text-brand-400">3</span>ステップ
              </h2>
              <p className="mx-auto max-w-md text-gray-400">
                アカウント登録から再生数の確認まで、シンプルな操作で完結します
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {steps.map((step, index) => (
                <div key={step.title} className="group relative">
                  {/* コネクターライン（PC表示時のみ） */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[60%] top-12 hidden h-px w-[80%] bg-gradient-to-r from-white/20 to-transparent md:block" />
                  )}

                  <div className="relative rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-colors hover:border-white/10">
                    {/* ステップ番号 */}
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-purple-500/20">
                      <step.icon className="h-6 w-6 text-brand-400" />
                    </div>

                    <div className="mb-2 text-xs font-medium text-brand-400">STEP {index + 1}</div>
                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 機能セクション */}
        <section id="features" className="px-4 py-20 md:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <span className="mb-3 block text-sm font-medium text-brand-400">FEATURES</span>
              <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">バズベースの特徴</h2>
              <p className="mx-auto max-w-md text-gray-400">
                インフルエンサーの活動をサポートする機能を揃えています
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent p-6 transition-all hover:-translate-y-1 hover:border-white/10"
                >
                  <div
                    className={`h-11 w-11 rounded-xl ${feature.color} mb-4 flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl">
              {/* 背景グラデーション */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 opacity-90" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

              <div className="relative px-6 py-12 text-center md:px-12 md:py-16">
                <h2 className="mb-4 font-display text-2xl font-bold md:text-3xl">
                  さっそく始めてみませんか？
                </h2>
                <p className="mx-auto mb-8 max-w-md text-white/80">
                  アカウント登録は無料。今すぐPR投稿の再生数をトラッキングしましょう。
                </p>
                <Link to="/signup">
                  <button className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-gray-900 shadow-xl shadow-black/20 transition-colors hover:bg-gray-100">
                    無料で始める
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="border-t border-white/5 px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-display font-bold">バズベース</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <a href="#" className="transition-colors hover:text-white">
                  利用規約
                </a>
                <a href="#" className="transition-colors hover:text-white">
                  プライバシーポリシー
                </a>
                <a href="#" className="transition-colors hover:text-white">
                  お問い合わせ
                </a>
              </div>

              <p className="text-sm text-gray-600">© {new Date().getFullYear()} BuzzBase</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// 使い方ステップ
const steps = [
  {
    title: 'URLを登録',
    description: 'InstagramやTikTokの商品PR投稿のURLを登録するだけ。',
    icon: Link2,
  },
  {
    title: '7日間待つ',
    description: '投稿から7日後に自動で再生数を取得します。何もする必要はありません。',
    icon: Calendar,
  },
  {
    title: '結果を確認',
    description: 'ダッシュボードで再生数を確認。過去の投稿と比較もできます。',
    icon: BarChart3,
  },
];

// 機能リスト
const features = [
  {
    title: '自動トラッキング',
    description: 'URLを登録すれば、7日後の再生数を自動で取得。手作業は不要です。',
    icon: TrendingUp,
    color: 'bg-gradient-to-br from-brand-500 to-brand-600',
  },
  {
    title: 'マルチSNS対応',
    description: 'InstagramとTikTokに対応。今後も対応SNSを拡大予定。',
    icon: Zap,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    title: 'セキュア認証',
    description: 'GoogleアカウントまたはメールでSSO。安心のセキュリティ。',
    icon: Shield,
    color: 'bg-gradient-to-br from-accent-500 to-accent-600',
  },
  {
    title: 'スマホ最適化',
    description: 'スマホでもPCでも使いやすいレスポンシブデザイン。',
    icon: Sparkles,
    color: 'bg-gradient-to-br from-pink-500 to-pink-600',
  },
  {
    title: '投稿履歴管理',
    description: '過去のPR投稿をすべて一覧で確認。成長を可視化。',
    icon: BarChart3,
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
  },
  {
    title: '完全無料',
    description: 'すべての機能を無料でご利用いただけます。',
    icon: Play,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
  },
];
