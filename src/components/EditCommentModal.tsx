"use client";

import { useState, useEffect } from "react";
import { X, FileText, Save } from "lucide-react";
import { updateAlbumComment } from "@/lib/albums";

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId: string;
  albumTitle: string;
  currentComment: string | null;
  onSuccess?: () => void;
}

export default function EditCommentModal({ 
  isOpen, 
  onClose, 
  albumId, 
  albumTitle, 
  currentComment,
  onSuccess 
}: EditCommentModalProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setComment(currentComment || "");
    }
  }, [isOpen, currentComment]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateAlbumComment(albumId, comment.trim());
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert(error instanceof Error ? error.message : "コメントの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setComment(currentComment || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl border border-[#D4AF37]/20 w-full max-w-lg shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
              <FileText className="text-[#D4AF37]" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">コメントを編集</h2>
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

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* コメント */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#F5F5DC] mb-2">
              <FileText size={16} className="text-[#D4AF37]" />
              コメント
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="このアルバムについて何か書いてみましょう..."
              className="w-full px-4 py-3 bg-[#0B192F] border border-[#D4AF37]/20 rounded-lg text-white placeholder-[#F5F5DC]/50 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
              disabled={loading}
              maxLength={500}
              rows={4}
              autoFocus
            />
            <p className="text-xs text-[#F5F5DC]/70 mt-1">{comment.length}/500文字</p>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
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
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#0B192F]"></div>
              ) : (
                <>
                  <Save size={18} />
                  保存
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}