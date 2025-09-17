"use client";

import { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { uploadPhoto, validatePhotoFile } from "@/lib/photos";

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId: string;
  albumTitle: string;
  onSuccess?: () => void;
}

export default function AddPhotoModal({ 
  isOpen, 
  onClose, 
  albumId, 
  albumTitle, 
  onSuccess 
}: AddPhotoModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = validatePhotoFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 10)); // 最大10枚
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      // 写真をアップロード
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await uploadPhoto({
          albumId: albumId,
          file: file,
        });
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }
      
      // フォームをリセット
      setSelectedFiles([]);
      setUploadProgress(0);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to upload photos:", error);
      alert(error instanceof Error ? error.message : "写真のアップロードに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedFiles([]);
    setUploadProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl border border-[#D4AF37]/20 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* ヘッダー (固定) */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4AF37]/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
              <ImageIcon className="text-[#D4AF37]" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">写真を追加</h2>
              <p className="text-sm text-[#F5F5DC]/70">{albumTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-[#F5F5DC] hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* コンテンツエリア (スクロール可能) */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 画像選択 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#F5F5DC] mb-2">
                <ImageIcon size={16} className="text-[#D4AF37]" />
                写真を選択 (最大10枚)
              </label>
              <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-lg p-6 text-center hover:border-[#D4AF37]/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={loading}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-[#F5F5DC]">写真を選択またはドラッグ&ドロップ</p>
                  <p className="text-xs text-[#F5F5DC]/70 mt-1">JPEG, PNG, WebP (最大10MB)</p>
                </label>
              </div>
            </div>

            {/* 選択された画像のプレビュー */}
            {selectedFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[#F5F5DC] mb-3">
                  選択された写真 ({selectedFiles.length}枚)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        disabled={loading}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 進行状況 */}
            {loading && uploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-sm text-[#F5F5DC] mb-1">
                  <span>アップロード中...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-[#0B192F] rounded-full h-2">
                  <div
                    className="bg-[#D4AF37] h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* フッター (固定) */}
        <div className="p-6 border-t border-[#D4AF37]/20 flex-shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-[#D4AF37]/20 text-[#F5F5DC] rounded-lg hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || selectedFiles.length === 0}
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#0B192F]"></div>
              ) : (
                <>
                  <Upload size={18} />
                  アップロード
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}