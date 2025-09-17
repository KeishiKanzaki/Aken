"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Download } from "lucide-react";

interface PhotoModalProps {
  photo: {
    id: string;
    url: string;
    caption: string;
    albumTitle: string;
  };
  onClose: () => void;
}

export function PhotoModal({ photo, onClose }: PhotoModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // 背景クリックでモーダルを閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 画像ダウンロード
  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.albumTitle}_${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('画像のダウンロードに失敗しました:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col p-2 md:p-4"
      onClick={handleBackdropClick}
    >
      {/* ヘッダー (固定) */}
      <div className="flex items-center justify-between mb-2 md:mb-4 flex-shrink-0">
        <div className="text-white flex-1 mr-4">
          <h3 className="text-base md:text-lg font-semibold line-clamp-1">{photo.albumTitle}</h3>
          {photo.caption && (
            <p className="text-[#F5F5DC]/70 text-xs md:text-sm line-clamp-2">{photo.caption}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-[#D4AF37] text-[#0B192F] rounded-lg hover:opacity-90 transition-opacity"
            title="画像をダウンロード"
          >
            <Download size={16} className="md:w-5 md:h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            title="閉じる"
          >
            <X size={16} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* 画像エリア (スクロール可能) */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="relative bg-[#1A1A1A] rounded-lg overflow-hidden max-w-full max-h-full">
          <Image
            src={photo.url}
            alt={photo.caption || photo.albumTitle}
            width={1200}
            height={800}
            className="w-auto h-auto max-w-full max-h-full object-contain"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      </div>
    </div>
  );
}