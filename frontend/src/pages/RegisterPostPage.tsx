import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  RefreshCw,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getUserProfile } from '@/lib/firestore/users';
import { getActiveCampaigns } from '@/lib/firestore/campaigns';
import { registerPRPost, isMediaIdAlreadyRegistered } from '@/lib/firestore/prPosts';
import { getInstagramMedia, saveThumbnailToStorage } from '@/lib/api/instagram';
import { Campaign, InstagramMedia, InstagramAccountWithId, PRPostRegisterInput } from '@/types';
import { getMeasurementDate, formatDate } from '@/lib/utils';

type Step = 1 | 2 | 3 | 4;

export function RegisterPostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ステップ管理
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // データ状態
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountWithId[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<InstagramMedia[]>([]);
  const [selectedPost, setSelectedPost] = useState<InstagramMedia | null>(null);

  // ローディング状態
  const [loading, setLoading] = useState(true);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [registering, setRegistering] = useState(false);

  // エラー状態
  const [error, setError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // トラブルシューティングモーダル
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState(false);

  // サポートGoogleフォームURL
  const SUPPORT_FORM_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSfguUNAvmG2Px_ez47Pph0sFXkqbEcMV8RdRM98lhOAotCOOg/viewform?usp=sharing&ouid=106448838806099721900';

  // 初期データ取得
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // ユーザープロフィールを取得
        const profile = await getUserProfile(user.uid);

        if (profile && profile.instagramAccounts) {
          const accountsArray = Object.entries(profile.instagramAccounts).map(
            ([accountId, accountInfo]) => ({
              accountId,
              ...accountInfo,
            })
          );
          setInstagramAccounts(accountsArray);
          if (accountsArray.length > 0) {
            setSelectedAccountId(accountsArray[0].accountId);
          }
        }

        // キャンペーンを別途取得（エラーが発生しても上記の処理には影響しない）
        const activeCampaigns = await getActiveCampaigns();
        setCampaigns(activeCampaigns);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  // Instagram投稿を取得
  const handleFetchPosts = async () => {
    if (!selectedAccountId) return;

    setFetchingPosts(true);
    setError(null);

    try {
      const data = await getInstagramMedia(selectedAccountId);
      if (data.media && data.media.data) {
        setInstagramPosts(data.media.data);
      } else {
        setInstagramPosts([]);
      }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setFetchingPosts(false);
    }
  };

  // 投稿選択時の重複チェック
  const handleSelectPost = async (post: InstagramMedia) => {
    if (!user) return;

    setDuplicateError(null);

    // Duplicate check
    const isDuplicate = await isMediaIdAlreadyRegistered(user.uid, post.id);
    if (isDuplicate) {
      setDuplicateError('This post has already been registered');
      return;
    }

    setSelectedPost(post);
  };

  // PR投稿を登録
  const handleRegister = async () => {
    if (!user || !selectedAccountId || !selectedCampaign || !selectedPost) return;

    setRegistering(true);
    setError(null);

    try {
      // Instagram APIから取得したサムネイルURLをGCSに保存して永続URLに変換
      const originalThumbnailUrl = selectedPost.thumbnail_url || selectedPost.media_url;
      let persistentThumbnailUrl: string | undefined = undefined;

      if (originalThumbnailUrl) {
        persistentThumbnailUrl = await saveThumbnailToStorage(
          originalThumbnailUrl,
          selectedAccountId,
          selectedPost.id
        );
      }

      const input: PRPostRegisterInput = {
        campaignId: selectedCampaign.id,
        campaignName: selectedCampaign.name,
        mediaId: selectedPost.id,
        mediaType: selectedPost.media_type,
        permalink: selectedPost.permalink || '',
        thumbnailUrl: persistentThumbnailUrl,
        postedAt: new Date(selectedPost.timestamp),
        mediaProductType: selectedPost.media_product_type,
      };

      await registerPRPost(user.uid, selectedAccountId, input);
      setCurrentStep(4); // 完了画面へ
    } catch (err) {
      console.error('Failed to register:', err);
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  // ステップナビゲーション
  const goToStep = (step: Step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      navigate('/dashboard');
    }
  };

  // 投稿画像URLを取得
  const getPostImageUrl = (post: InstagramMedia): string | null => {
    if (post.media_type === 'VIDEO') {
      return post.thumbnail_url || null;
    }
    return post.media_url || null;
  };

  // SNSアカウント未連携時はダッシュボードにリダイレクト
  useEffect(() => {
    if (!loading && instagramAccounts.length === 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, instagramAccounts.length, navigate]);

  // ローディング画面
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // SNSアカウント未連携の場合はリダイレクト中なのでnullを返す
  if (instagramAccounts.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen animate-fade-in bg-white">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-20 border-b border-gray-200/50 px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center">
          <button
            onClick={goBack}
            className="mr-4 rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Register PR Post</h1>
        </div>
      </header>

      {/* プログレスバー */}
      {currentStep < 4 && (
        <div className="px-4 py-6">
          <div className="mx-auto max-w-lg">
            {/* ステップ表示 */}
            <div className="relative">
              {/* 接続線（背景に配置） */}
              <div className="absolute left-0 right-0 top-4 mx-12">
                <div className="h-0.5 bg-gray-200" />
                <div
                  className="absolute left-0 top-0 h-0.5 transition-all"
                  style={{
                    backgroundColor: '#f29801',
                    width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                  }}
                />
              </div>
              {/* ステップ円とラベル */}
              <div className="relative flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => goToStep(step as Step)}
                    disabled={step > currentStep}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        step < currentStep
                          ? 'bg-green-500 text-white'
                          : step === currentStep
                            ? 'text-white'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                      style={step === currentStep ? { backgroundColor: '#f29801' } : {}}
                    >
                      {step < currentStep ? <Check className="h-4 w-4" /> : step}
                    </div>
                    <span
                      className={`mt-2 text-xs ${
                        step === currentStep ? 'font-medium text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step === 1 ? 'Select Product' : step === 2 ? 'Select Post' : 'Confirm'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* コンテンツ */}
      <main className="px-4 pb-32">
        <div className="mx-auto max-w-lg">
          {/* Step 1: Select Product */}
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Which product is this PR post for?</h2>

              {campaigns.length === 0 ? (
                <div
                  className="rounded-2xl border p-6 text-center"
                  style={{ borderColor: '#e5e5e5' }}
                >
                  <div
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#f5f5f5' }}
                  >
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No products available for registration</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => {
                    const isSelected = selectedCampaign?.id === campaign.id;
                    return (
                      <button
                        key={campaign.id}
                        onClick={() => setSelectedCampaign(campaign)}
                        className={`relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                          isSelected ? 'ring-2 ring-opacity-50' : 'hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: isSelected ? '#f29801' : '#e5e5e5',
                          backgroundColor: isSelected ? '#fff8ed' : 'white',
                          ...(isSelected && { ringColor: '#f29801' }),
                        }}
                      >
                        {/* 商品画像 */}
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {campaign.imageUrl ? (
                            <img
                              src={campaign.imageUrl}
                              alt={campaign.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        {/* 商品情報 */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-900">{campaign.name}</p>
                          {campaign.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                        {/* チェックマーク */}
                        {isSelected && (
                          <CheckCircle2
                            className="h-6 w-6 flex-shrink-0"
                            style={{ color: '#f29801' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Post */}
          {currentStep === 2 && (
            <div className="animate-fade-in space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Which post would you like to register?</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedCampaign?.name}</p>
              </div>

              {/* Instagram Post Fetch Button */}
              {instagramPosts.length === 0 && !fetchingPosts && (
                <div className="rounded-2xl border p-6" style={{ borderColor: '#e5e5e5' }}>
                  <p className="mb-4 text-sm text-gray-500">Fetch recent posts from Instagram</p>
                  <Button onClick={handleFetchPosts} disabled={fetchingPosts} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fetch Posts
                  </Button>
                </div>
              )}

              {/* ローディング */}
              {fetchingPosts && (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {/* エラー表示 */}
              {error && (
                <div
                  className="flex items-start gap-3 rounded-lg border p-4"
                  style={{ backgroundColor: '#fff1f0', borderColor: '#ffc8c4' }}
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#e61f13' }} />
                  <p className="text-sm" style={{ color: '#e61f13' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* 重複エラー表示 */}
              {duplicateError && (
                <div
                  className="flex items-start gap-3 rounded-lg border p-4"
                  style={{ backgroundColor: '#fff1f0', borderColor: '#ffc8c4' }}
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#e61f13' }} />
                  <p className="text-sm" style={{ color: '#e61f13' }}>
                    {duplicateError}
                  </p>
                </div>
              )}

              {/* 投稿グリッド */}
              {instagramPosts.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {instagramPosts.map((post) => {
                    const imageUrl = getPostImageUrl(post);
                    const isSelected = selectedPost?.id === post.id;
                    return (
                      <button
                        key={post.id}
                        onClick={() => handleSelectPost(post)}
                        className={`group relative aspect-square overflow-hidden rounded-lg bg-gray-100 transition-all ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={
                          isSelected
                            ? { outlineColor: '#f29801', boxShadow: '0 0 0 2px #f29801' }
                            : {}
                        }
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`投稿 ${post.id}`}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                        {/* 選択オーバーレイ */}
                        {isSelected && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(242, 152, 1, 0.3)' }}
                          >
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </div>
                        )}
                        {/* 日付 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-xs text-white">
                            {formatDate(new Date(post.timestamp))}
                          </p>
                        </div>
                        {/* 動画バッジ */}
                        {post.media_type === 'VIDEO' && (
                          <div className="absolute right-1 top-1">
                            <span className="inline-flex items-center rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                              ▶
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* サポート導線 */}
              {instagramPosts.length > 0 && (
                <div
                  className="mt-4 rounded-lg border p-4"
                  style={{ borderColor: '#e5e5e5', backgroundColor: '#fafafa' }}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setIsTroubleshootingOpen(true)}
                      className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-gray-200"
                      aria-label="Troubleshooting"
                    >
                      <HelpCircle className="h-5 w-5 text-gray-500" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600">
                        If posts are not showing, please check{' '}
                        <button
                          onClick={() => setIsTroubleshootingOpen(true)}
                          className="mx-1 font-medium underline"
                          style={{ color: '#f29801' }}
                        >
                          here
                        </button>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        If the issue persists, please{' '}
                        <a
                          href={SUPPORT_FORM_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 inline-flex items-center gap-0.5 font-medium underline"
                          style={{ color: '#f29801' }}
                        >
                          contact support
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {currentStep === 3 && selectedCampaign && selectedPost && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Register with the following information?</h2>

              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: '#e5e5e5' }}
              >
                {/* 投稿サムネイル */}
                <div className="aspect-square bg-gray-100">
                  {getPostImageUrl(selectedPost) ? (
                    <img
                      src={getPostImageUrl(selectedPost) || ''}
                      alt="Selected post"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4 p-4">
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-semibold text-gray-900">{selectedCampaign.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Posted Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(new Date(selectedPost.timestamp))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Measurement Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(getMeasurementDate(new Date(selectedPost.timestamp)))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account</p>
                    <p className="font-semibold text-gray-900">
                      @{instagramAccounts.find((a) => a.accountId === selectedAccountId)?.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div
                className="flex items-start gap-3 rounded-lg p-4"
                style={{ backgroundColor: '#fff8ed' }}
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#f29801' }} />
                <p className="text-sm text-gray-600">Views will be automatically fetched after 7 days</p>
              </div>

              {/* エラー表示 */}
              {error && (
                <div
                  className="flex items-start gap-3 rounded-lg border p-4"
                  style={{ backgroundColor: '#fff1f0', borderColor: '#ffc8c4' }}
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#e61f13' }} />
                  <p className="text-sm" style={{ color: '#e61f13' }}>
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="animate-fade-in py-12 text-center">
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Registration Complete!</h2>
              <p className="mb-8 text-gray-500">Views will be automatically fetched after 7 days</p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedCampaign(null);
                    setSelectedPost(null);
                  }}
                  className="w-full"
                >
                  Register Another Post
                </Button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full rounded-lg border py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#e5e5e5' }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* フッターナビゲーション */}
      {currentStep < 4 && (
        <footer className="glass safe-bottom fixed bottom-0 left-0 right-0 border-t border-gray-200/50 px-4 py-4">
          <div className="mx-auto flex max-w-lg gap-3">
            <button
              onClick={goBack}
              className="flex-1 rounded-lg border py-3 font-medium text-gray-600 transition-colors hover:bg-gray-50"
              style={{ borderColor: '#e5e5e5' }}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            {currentStep === 3 ? (
              <Button onClick={handleRegister} disabled={registering} className="flex-1">
                {registering ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={
                  (currentStep === 1 && !selectedCampaign) || (currentStep === 2 && !selectedPost)
                }
                className="flex-1"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </footer>
      )}

      {/* Troubleshooting Modal */}
      {isTroubleshootingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsTroubleshootingOpen(false)}
          />
          {/* Modal Content */}
          <div className="relative z-10 mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Posts Not Showing</h3>
              <button
                onClick={() => setIsTroubleshootingOpen(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Troubleshooting Content */}
            <div className="space-y-4">
              <div className="rounded-lg p-4" style={{ backgroundColor: '#fff8ed' }}>
                <h4 className="mb-2 font-medium text-gray-900">1. Check Account Settings</h4>
                <p className="text-sm text-gray-600">
                  Make sure your Instagram account is set to "Business Account" or "Creator Account". Personal accounts cannot fetch posts.
                </p>
              </div>

              <div className="rounded-lg p-4" style={{ backgroundColor: '#fff8ed' }}>
                <h4 className="mb-2 font-medium text-gray-900">2. Facebook Page Connection</h4>
                <p className="text-sm text-gray-600">
                  Instagram Business accounts must be connected to a Facebook page. Please check the connection status in your Instagram settings.
                </p>
              </div>

              <div className="rounded-lg p-4" style={{ backgroundColor: '#fff8ed' }}>
                <h4 className="mb-2 font-medium text-gray-900">3. Try Reconnecting</h4>
                <p className="text-sm text-gray-600">
                  The required permissions may not have been granted during connection. Please reconnect your SNS account from the "Settings" in the dashboard.
                </p>
              </div>

              <div className="border-t pt-4" style={{ borderColor: '#e5e5e5' }}>
                <p className="text-sm text-gray-600">
                  If the issue persists after trying the above, please contact support.
                </p>
                <a
                  href={SUPPORT_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#e5e5e5', color: '#525252' }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Support Form
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
