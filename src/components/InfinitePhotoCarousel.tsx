"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PhotoModal } from "./PhotoModal";

interface Photo {
  id: string;
  file_path: string;
  caption?: string;
}

interface InfinitePhotoCarouselProps {
  photos: Photo[];
  photoUrls: Record<string, string>;
  albumTitle: string;
  className?: string;
}

export function InfinitePhotoCarousel({ 
  photos, 
  photoUrls, 
  albumTitle, 
  className = "" 
}: InfinitePhotoCarouselProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [lastTouchX, setLastTouchX] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 写真が少ない場合は複製して無限スクロール効果を作る
  const duplicatedPhotos = photos.length > 0 ? [
    ...photos,
    ...photos,
    ...(photos.length < 5 ? photos : []) // 5枚未満の場合はさらに複製
  ] : [];

  const getImageUrl = (photo: Photo) => {
    return photoUrls[photo.id] || '/placeholder-image.jpg';
  };

  // 自動スクロール制御（2枚以上の場合のみ）
  useEffect(() => {
    if (!isPlaying || !scrollRef.current || duplicatedPhotos.length === 0 || photos.length === 1) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;

    // モバイルかどうかを判定
    const isMobile = window.innerWidth < 768;
    const scrollSpeed = isMobile ? 0.5 : 1; // モバイルでは半分の速度

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;

        // 最初の複製分をスクロールし終えたら先頭に戻る
        const maxScroll = scrollContainer.scrollWidth / (duplicatedPhotos.length > photos.length * 2 ? 3 : 2);
        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, duplicatedPhotos.length, photos.length]);

  // グローバルマウスイベントの管理
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - dragStart.x) * 2;
      scrollRef.current.scrollLeft = dragStart.scrollLeft - walk;
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setTimeout(() => {
          setIsPlaying(true);
        }, 1000);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  // ホバー時の一時停止
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsPlaying(true);
    }
  };

  // マウスドラッグでのスクロール
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setIsPlaying(false);
    setDragStart({
      x: e.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStart.x) * 2; // スクロール速度調整
    scrollRef.current.scrollLeft = dragStart.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // ドラッグ終了後、少し待ってから自動スクロールを再開
    setTimeout(() => {
      setIsPlaying(true);
    }, 1000);
  };

  // マウスホイール・トラックパッドでのスクロール
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    setIsPlaying(false);
    
    // トラックパッドの2本指スクロールを検出
    // deltaX が存在する場合は横スクロール、そうでなければ縦スクロールを横に変換
    const scrollAmount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    
    // スクロール感度を調整（トラックパッドは通常より細かい値が来る）
    const sensitivity = Math.abs(e.deltaX) > 0 ? 1 : 1.5; // 横スクロールは直接、縦スクロールは少し強めに
    scrollRef.current.scrollLeft += scrollAmount * sensitivity;
    
    // スクロール操作後、少し待ってから自動スクロールを再開
    setTimeout(() => {
      setIsPlaying(true);
    }, 2000);
  };

  // タッチイベント（モバイル・トラックパッド対応）
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const touch = e.touches[0];
    setLastTouchX(touch.clientX);
    setIsPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = lastTouchX - touch.clientX;
    scrollRef.current.scrollLeft += deltaX;
    setLastTouchX(touch.clientX);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsPlaying(true);
    }, 1500);
  };

  if (photos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-[#D4AF37] text-2xl">📸</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">写真がありません</h3>
        <p className="text-[#F5F5DC]/70">このアルバムにはまだ写真がアップロードされていません。</p>
      </div>
    );
  }

  // 1枚の場合は中央に大きく表示
  if (photos.length === 1) {
    const singlePhoto = photos[0];
    const imageUrl = getImageUrl(singlePhoto);
    
    // デバッグ用ログ
    console.log('Single photo data:', singlePhoto);
    console.log('Image URL:', imageUrl);
    
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-white">
            1枚の写真
          </h3>
        </div>
        
        <div className="flex justify-center">
          <div
            className="group cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => setSelectedPhoto(singlePhoto)}
          >
            <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[512px] lg:h-[512px] rounded-xl md:rounded-2xl overflow-hidden bg-[#1A1A1A] shadow-2xl border border-[#D4AF37]/20">
              <Image
                src={imageUrl}
                alt={singlePhoto.caption || albumTitle}
                fill
                className="object-cover transition-transform group-hover:scale-110"
                sizes="(max-width: 768px) 320px, (max-width: 1024px) 384px, 512px"
                priority
                onError={() => console.error('Image failed to load:', imageUrl)}
                onLoad={() => console.log('Image loaded successfully:', imageUrl)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* キャプション */}
              {singlePhoto.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm md:text-base font-medium">{singlePhoto.caption}</p>
                </div>
              )}

              {/* 拡大表示アイコン */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm md:text-base">🔍</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2枚以上の場合は無限スクロールカルーセル
  return (
    <>
      <div className={`relative overflow-hidden ${className}`}>
        {/* コントロールバー */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white">
              {photos.length}枚の写真
            </h3>
            <p className="text-xs md:text-sm text-[#F5F5DC]/60 mt-1">
            </p>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-2 md:px-4 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            {isPlaying ? "⏸️ 一時停止" : "▶️ 再生"}
          </button>
        </div>

        {/* 流れる写真カルーセル */}
        <div
          ref={scrollRef}
          className={`flex gap-4 md:gap-6 overflow-x-hidden pb-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {duplicatedPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="flex-shrink-0 group cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => {
                if (!isDragging) {
                  setSelectedPhoto(photo);
                }
              }}
            >
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-xl md:rounded-2xl overflow-hidden bg-[#1A1A1A] shadow-lg">
                <Image
                  src={getImageUrl(photo)}
                  alt={photo.caption || albumTitle}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 320px"
                  unoptimized // 無限スクロールのパフォーマンスのため
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* キャプション */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs md:text-sm font-medium line-clamp-2">{photo.caption}</p>
                  </div>
                )}

                {/* 拡大表示アイコン */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">🔍</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* スクロールバーを隠すCSS */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* 写真モーダル */}
      {selectedPhoto && (
        <PhotoModal
          photo={{
            id: selectedPhoto.id,
            url: getImageUrl(selectedPhoto),
            caption: selectedPhoto.caption || '',
            albumTitle: albumTitle
          }}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </>
  );
}