import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* ヒーローセクション */}
      <section className="relative">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/2 -top-1/2 h-[800px] w-[800px] rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 h-[600px] w-[600px] rounded-full bg-accent-500/20 blur-3xl" />
        </div>

        {/* ヘッダー */}
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <span className="font-display text-2xl font-bold">
              Buzz<span className="text-brand-400">Base</span>
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-gray-300 transition-colors hover:text-white">
              機能
            </a>
            <a href="#how-it-works" className="text-gray-300 transition-colors hover:text-white">
              使い方
            </a>
          </nav>

          <Link to="/login">
            <Button
              variant="secondary"
              size="sm"
              className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/20"
            >
              ログイン
            </Button>
          </Link>
        </header>

        {/* ヒーローコンテンツ */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-brand-400" />
              <span className="text-sm text-gray-300">インフルエンサーの新しい味方</span>
            </div>

            <h1 className="mb-6 animate-slide-up font-display text-4xl font-bold leading-tight md:text-6xl">
              再生数を
              <span className="text-gradient bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                {' '}
                可視化{' '}
              </span>
              して
              <br />
              収益を最大化
            </h1>

            <p
              className="mb-10 animate-slide-up text-lg text-gray-400 md:text-xl"
              style={{ animationDelay: '0.1s' }}
            >
              商品PR投稿の再生数を自動トラッキング。
              <br />
              7日後の実績を一目で確認できます。
            </p>

            <div
              className="flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row"
              style={{ animationDelay: '0.2s' }}
            >
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  無料で始める
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full !text-gray-300 hover:!text-white sm:w-auto"
                >
                  ログイン
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="bg-gray-900/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              バズベースでできること
            </h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              シンプルな操作で、投稿パフォーマンスを効率的に管理
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-white/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`h-12 w-12 rounded-xl ${feature.color} mb-4 flex items-center justify-center`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <span className="font-display text-xl font-bold">BuzzBase</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} BuzzBase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: '自動トラッキング',
    description: '投稿URLを登録するだけで、7日後の再生数を自動で取得します。',
    icon: TrendingUp,
    color: 'bg-gradient-to-br from-brand-500 to-brand-600',
  },
  {
    title: 'マルチプラットフォーム',
    description: 'Instagram、TikTokなど、複数のSNSに対応しています。',
    icon: Zap,
    color: 'bg-gradient-to-br from-accent-500 to-accent-600',
  },
  {
    title: 'セキュア認証',
    description: 'Googleアカウントまたはメールで簡単・安全にログイン。',
    icon: Shield,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
];
