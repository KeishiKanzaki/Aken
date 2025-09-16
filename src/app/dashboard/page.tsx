"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentUser, signOut } from "@/lib/auth";
import { Plus, Calendar, Clock, Lock, Unlock, ArrowLeft } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B192F] via-[#1A1A1A] to-[#232946] text-white">
      {/* ナビゲーションバー */}
      <nav className="bg-[#0B192F]/80 backdrop-blur-sm border-b border-[#D4AF37]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBackToHome}
                className="text-[#F5F5DC] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span className="font-serif text-2xl text-[#D4AF37] font-bold">時の宝箱</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#F5F5DC] text-sm">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-[#F5F5DC] hover:text-[#D4AF37] transition-colors px-4 py-2 rounded-lg"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">
            あなたの宝箱へようこそ
          </h1>
          <p className="text-xl md:text-2xl text-[#F5F5DC] mb-12 max-w-3xl mx-auto">
            大切な思い出を保管し、特別な日に再び開きましょう。
          </p>

          {/* 新規作成ボタン */}
          <button className="bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] px-12 py-4 rounded-full font-bold text-xl shadow-xl hover:opacity-90 transition flex items-center gap-3 mx-auto">
            <Plus size={24} />
            新しいアルバムを作成
          </button>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl p-8 border border-[#D4AF37]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                  <Calendar className="text-[#D4AF37]" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#D4AF37]">0</h3>
                  <p className="text-[#F5F5DC]">作成済みアルバム</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl p-8 border border-[#D4AF37]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Clock className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-400">0</h3>
                  <p className="text-[#F5F5DC]">待機中のアルバム</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl p-8 border border-[#D4AF37]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Unlock className="text-green-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-400">0</h3>
                  <p className="text-[#F5F5DC]">公開中のアルバム</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* アルバム一覧セクション */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#D4AF37] mb-12 text-center">
            あなたのアルバム
          </h2>

          {/* 空の状態 */}
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-full flex items-center justify-center border-2 border-dashed border-[#D4AF37]/30">
              <Calendar className="text-[#D4AF37]/50" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F5F5DC] mb-4">
              まだアルバムがありません
            </h3>
            <p className="text-[#F5F5DC]/70 mb-8 max-w-md mx-auto">
              最初のアルバムを作成して、大切な思い出を未来に封印しましょう。
            </p>
            <button className="bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] px-8 py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2 mx-auto">
              <Plus size={20} />
              アルバムを作成
            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-[#D4AF37]/20 py-8 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#F5F5DC]/70">
            時の宝箱 - あなたの思い出を未来に届けます
          </p>
        </div>
      </footer>
    </main>
  );
}