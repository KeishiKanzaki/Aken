"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { getAlbum, checkAlbumAccess, Album } from "@/lib/albums";
import { getPhotoUrl } from "@/lib/photos";
import { ArrowLeft, Clock, Lock, Unlock, Download, Calendar } from "lucide-react";

export default function AlbumDetailPage() {
  const [user, setUser] = useState<any>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
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
      if (accessInfo.status === 'unlocked' && accessInfo.timeRemaining) {
        setTimeRemaining(accessInfo.timeRemaining);
      } else {
        setTimeRemaining(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [album]);

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
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}時間${minutes}分${seconds}秒`;
  };

  const getImageUrl = (photo: any) => {
    return photoUrls[photo.id] || '/placeholder-image.jpg';
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

  // アクセス権限チェック
  if (!accessInfo.canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-red-400" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {accessInfo.status === 'sealed' ? 'アルバムは未開封です' : 'アルバムの公開期間が終了しました'}
          </h1>
          <p className="text-[#F5F5DC]/70 mb-6">
            {accessInfo.status === 'sealed' 
              ? 'このアルバムをまず開封してください。' 
              : '24時間の公開期間が終了したため、写真を閲覧できません。'
            }
          </p>
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
            
            {timeRemaining && (
              <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                <Clock size={16} />
                残り {formatTimeRemaining(timeRemaining)}
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

        {/* 写真グリッド */}
        {album.photos && album.photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {album.photos.map((photo) => (
              <div key={photo.id} className="group bg-[#1A1A1A] rounded-2xl overflow-hidden hover:scale-105 transition-transform">
                <div className="relative aspect-square">
                  <Image
                    src={getImageUrl(photo)}
                    alt={photo.caption || album.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                {photo.caption && (
                  <div className="p-4">
                    <p className="text-[#F5F5DC]/80 text-sm">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-[#D4AF37]" size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">写真がありません</h3>
            <p className="text-[#F5F5DC]/70">このアルバムにはまだ写真がアップロードされていません。</p>
          </div>
        )}
      </div>
    </div>
  );
}