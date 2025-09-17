"use client";

import { useEffect, useState } from "react";
import { Clock, Star } from "lucide-react";

interface AlbumExpiryOverlayProps {
  isVisible: boolean;
  albumTitle: string;
  onComplete: () => void;
}

export function AlbumExpiryOverlay({ 
  isVisible, 
  albumTitle, 
  onComplete 
}: AlbumExpiryOverlayProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (!isVisible) return;

    // パーティクル（桜の花びら）を生成
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      delay: Math.random() * 2000, // 遅延を短縮
    }));
    setParticles(newParticles);

    // アニメーションステージを段階的に進める
    const timeouts = [
      setTimeout(() => setAnimationStage(1), 100),   // フェードイン開始
      setTimeout(() => setAnimationStage(2), 1000),  // メインメッセージ表示
      setTimeout(() => setAnimationStage(4), 4000),  // 最終メッセージ（3秒後に変更）
      setTimeout(() => {
        setAnimationStage(5); // フェードアウト開始
        setTimeout(() => onComplete(), 2000); // 完全に終了
      }, 7000), // 7秒で終了に変更
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景オーバーレイ */}
      <div 
        className={`absolute inset-0 transition-all duration-2000 ${
          animationStage >= 1 && animationStage < 5 
            ? 'bg-gradient-to-b from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      />

      {/* パーティクル（桜の花びら） */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-3 h-3 transition-all duration-[6000ms] ease-linear ${
            animationStage >= 1 && animationStage < 5 ? 'opacity-70' : 'opacity-0'
          }`}
          style={{
            left: `${particle.x}%`,
            top: animationStage >= 1 && animationStage < 5 ? '110%' : '-10%',
            transitionDelay: `${particle.delay}ms`,
          }}
        >
          <div className="w-full h-full bg-pink-300 rounded-full animate-pulse" />
        </div>
      ))}

      {/* 星のパーティクル */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className={`absolute transition-all duration-3000 ${
            animationStage >= 2 && animationStage < 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transitionDelay: `${Math.random() * 1500}ms`, // 遅延を短縮
          }}
        >
          <Star className="w-2 h-2 text-yellow-300 animate-pulse" fill="currentColor" />
        </div>
      ))}

      {/* メインコンテンツ */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
        
        {/* メインメッセージ */}
        <div className={`transition-all duration-2000 delay-500 ${
          animationStage >= 2 && animationStage < 5 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-6xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 mb-6 leading-tight">
            ありがとう
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
            「{albumTitle}」の時間が終わりました
          </p>
          <p className="text-2xl text-white/70 mb-8 italic">
            閲覧期限に達したため、写真はもう見ることができません
          </p>
        </div>

        {/* 最終メッセージ */}
        <div className={`transition-all duration-2000 delay-1000 ${
          animationStage >= 4 && animationStage < 5 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center justify-center gap-4 text-white/70">
            <Clock className="w-6 h-6" />
            <p className="text-2xl font-light">
              また新しい思い出を作りましょう
            </p>
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* グラデーション効果 */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-3000 ${
        animationStage >= 2 && animationStage < 5 
          ? 'opacity-30' 
          : 'opacity-0'
      }`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/20 via-transparent to-purple-500/20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-indigo-500/20 via-transparent to-pink-500/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}