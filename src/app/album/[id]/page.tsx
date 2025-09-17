"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAlbum, checkAlbumAccess, Album } from "@/lib/albums";
import { getPhotoUrl } from "@/lib/photos";
import { ArrowLeft, Clock, Lock, Unlock, Calendar } from "lucide-react";
import { InfinitePhotoCarousel } from "@/components/InfinitePhotoCarousel";
import { AlbumExpiryOverlay } from "@/components/AlbumExpiryOverlay";

export default function AlbumDetailPage() {
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [showExpiryOverlay, setShowExpiryOverlay] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      await loadAlbum();
    };

    checkAuth();
  }, [router, albumId]);

  // リアルタイムでカウントダウン更新
  useEffect(() => {
    if (!album) return;

    const updateTimer = () => {
      const accessInfo = checkAlbumAccess(album);
      console.log('updateTimer実行:', {
        status: accessInfo.status,
        canAccess: accessInfo.canAccess,
        timeRemaining: accessInfo.timeRemaining,
        hasExpired,
        showExpiryOverlay
      });

      if (accessInfo.status === 'unlocked' && accessInfo.timeRemaining) {
        const remaining = accessInfo.timeRemaining;
        setTimeRemaining(remaining);
        
        // 期限切れ直前の準備（まだ期限切れになっていない場合のみ）
        if (!hasExpired && remaining <= 2000) {
          // 2秒以内になったら期限切れの準備をする
          console.log('期限切れまで残り:', remaining, 'ms');
        }
      } else if (accessInfo.status === 'expired' && !hasExpired) {
        // 期限切れになった瞬間の処理
        console.log('期限切れを検出しました');
        setTimeRemaining(0); // 最後に0を表示
        setHasExpired(true);
        
        // 1秒後にオーバーレイを表示
        setTimeout(() => {
          console.log('エモーショナルオーバーレイを表示します');
          setShowExpiryOverlay(true);
        }, 1000);
      } else if (accessInfo.status === 'expired' && hasExpired) {
        // 既に期限切れ処理済みの場合は何もしない
        console.log('期限切れ処理済み');
        setTimeRemaining(0);
      } else {
        setTimeRemaining(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [album, hasExpired]); // showExpiryOverlayを依存配列から削除

  // アルバム読み込み時の初期状態チェック
  useEffect(() => {
    if (!album) return;
    
    const accessInfo = checkAlbumAccess(album);
    console.log('アルバム読み込み時の初期チェック:', {
      status: accessInfo.status,
      canAccess: accessInfo.canAccess,
      hasExpired
    });

    if (accessInfo.status === 'expired' && !hasExpired) {
      console.log('アルバム読み込み時に期限切れを検出');
      setTimeRemaining(0);
      setHasExpired(true);
      setTimeout(() => {
        console.log('アルバム読み込み時: エモーショナルオーバーレイを表示');
        setShowExpiryOverlay(true);
      }, 1000);
    }
  }, [album]); // albumが変更された時のみ実行

  const loadAlbum = async () => {
    try {
      const albumData = await getAlbum(albumId);
      setAlbum(albumData);
      
      // 写真のURLを生成
      if (albumData.photos && albumData.photos.length > 0) {
        const urls: Record<string, string> = {};
        for (const photo of albumData.photos) {
          try {
            urls[photo.id] = await getPhotoUrl(photo.file_path);
          } catch (error) {
            console.error(`写真 ${photo.id} のURL取得に失敗:`, error);
          }
        }
        setPhotoUrls(urls);
      }
    } catch (error) {
      console.error('アルバムの取得に失敗しました:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return '0時間0分0秒';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}時間${minutes}分${seconds}秒`;
  };

  const handleExpiryComplete = () => {
    setShowExpiryOverlay(false);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">アルバムが見つかりません</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#D4AF37] text-[#0B192F] px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  const accessInfo = checkAlbumAccess(album);

  // アクセス権限チェック（未開封の場合のみ早期リターン）
  if (!accessInfo.canAccess && accessInfo.status === 'sealed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-red-400" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">アルバムは未開封です</h1>
          <p className="text-[#F5F5DC]/70 mb-6">このアルバムをまず開封してください。</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#D4AF37] text-[#0B192F] px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946]">
      {/* 期限切れの場合の特別な処理 */}
      {accessInfo.status === 'expired' && !showExpiryOverlay && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
            <p className="text-white/70 text-lg">お疲れ様でした...</p>
          </div>
        </div>
      )}

      {/* アクティブなアルバム表示（期限切れ以外） */}
      {accessInfo.status === 'unlocked' && (
        <>
          {/* ヘッダー */}
          <div className="sticky top-0 z-10 bg-[#0B192F]/80 backdrop-blur-sm border-b border-[#D4AF37]/20">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F5F5DC] transition-colors"
                >
                  <ArrowLeft size={20} />
                  戻る
                </button>
                
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all duration-500 ${
                    timeRemaining <= 30000 
                      ? 'bg-red-500/30 text-red-300 animate-pulse border border-red-400/50' 
                      : timeRemaining <= 300000 
                      ? 'bg-orange-500/30 text-orange-300 border border-orange-400/50'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    <Clock size={16} className={timeRemaining <= 30000 ? 'animate-spin' : ''} />
                    <span className={timeRemaining <= 10000 ? 'font-bold text-lg' : ''}>
                      残り {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="container mx-auto px-4 py-8">
            {/* アルバム情報 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">{album.title}</h1>
              <div className="flex items-center justify-center gap-4 text-[#F5F5DC]/70">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  開封日: {album.unlock_date ? new Date(album.unlock_date).toLocaleDateString('ja-JP') : '-'}
                </div>
                <div className="flex items-center gap-1">
                  <Unlock size={16} />
                  {album.photos?.length || 0}枚の写真
                </div>
              </div>
            </div>

            {/* 写真カルーセル */}
            <InfinitePhotoCarousel
              photos={album.photos || []}
              photoUrls={photoUrls}
              albumTitle={album.title}
              className="mt-8"
            />
          </div>
        </>
      )}

      {/* 期限切れオーバーレイ */}
      <AlbumExpiryOverlay
        isVisible={showExpiryOverlay}
        albumTitle={album.title}
        onComplete={handleExpiryComplete}
      />
    </div>
  );
}