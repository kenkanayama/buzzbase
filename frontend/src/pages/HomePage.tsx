import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* ヒーローセクション */}
      <section className="relative">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] rounded-full bg-accent-500/20 blur-3xl" />
        </div>

        {/* ヘッダー */}
        <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-display font-bold text-2xl">
              Buzz<span className="text-brand-400">Base</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              機能
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              使い方
            </a>
          </nav>

          <Link to="/login">
            <Button variant="secondary" size="sm" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
              ログイン
            </Button>
          </Link>
        </header>

        {/* ヒーローコンテンツ */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-gray-300">インフルエンサーの新しい味方</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6 animate-slide-up">
              再生数を
              <span className="text-gradient bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                {' '}可視化{' '}
              </span>
              して<br />収益を最大化
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              商品PR投稿の再生数を自動トラッキング。<br />
              7日後の実績を一目で確認できます。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  無料で始める
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="!text-gray-300 hover:!text-white w-full sm:w-auto">
                  ログイン
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-24 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              バズベースでできること
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              シンプルな操作で、投稿パフォーマンスを効率的に管理
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-display font-bold text-xl">BuzzBase</span>
          </div>
          <p className="text-gray-500 text-sm">
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

