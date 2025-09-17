"use client";

import { Trash2, X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  albumTitle: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  albumTitle,
  isDeleting
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl border border-[#D4AF37]/20 p-8 max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">アルバムを削除</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#F5F5DC]/60 hover:text-[#F5F5DC] transition-colors"
            disabled={isDeleting}
          >
            <X size={24} />
          </button>
        </div>

        {/* 警告メッセージ */}
        <div className="mb-6">
          <p className="text-[#F5F5DC]/90 mb-4">
            本当に「<span className="font-bold text-[#D4AF37]">{albumTitle}</span>」を削除しますか？
          </p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              ⚠️ この操作は取り消せません。アルバムと含まれる全ての写真が完全に削除されます。
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#F5F5DC]/10 text-[#F5F5DC] py-3 rounded-lg font-medium hover:bg-[#F5F5DC]/20 transition-colors border border-[#F5F5DC]/20"
            disabled={isDeleting}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                削除中...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                削除する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}