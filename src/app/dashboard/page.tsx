"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentUser, signOut } from "@/lib/auth";
import { getUserAlbums, getAlbumStats, Album, checkAlbumAccess, unsealAlbum, deleteAlbum } from "@/lib/albums";
import { Plus, Calendar, Clock, Lock, Unlock, ArrowLeft, Eye, ImageIcon, Trash2, MoreVertical, Upload, Edit3 } from "lucide-react";
import CreateAlbumModal from "@/components/CreateAlbumModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import AddPhotoModal from "@/components/AddPhotoModal";
import EditCommentModal from "@/components/EditCommentModal";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addPhotoModalOpen, setAddPhotoModalOpen] = useState(false);
  const [editCommentModalOpen, setEditCommentModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [stats, setStats] = useState({ total: 0, sealed: 0, unlocked: 0, expired: 0 });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      await loadData();
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadData = async () => {
    try {
      const [albumsData, statsData] = await Promise.all([
        getUserAlbums(),
        getAlbumStats(),
      ]);
      setAlbums(albumsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleCreateAlbum = () => {
    setCreateModalOpen(true);
  };

  const handleAlbumCreated = () => {
    // アルバム一覧を再取得
    loadData();
  };

  const handleUnsealAlbum = async (albumId: string) => {
    try {
      await unsealAlbum(albumId);
      // アルバム一覧を再取得して表示を更新
      await loadData();
    } catch (error) {
      console.error('アルバムの開封に失敗しました:', error);
      // エラーハンドリング（必要に応じてトースト表示等）
    }
  };

  const handleDeleteClick = (album: Album) => {
    setSelectedAlbum(album);
    setDeleteModalOpen(true);
  };

  const handleAddPhotoClick = (album: Album) => {
    setSelectedAlbum(album);
    setAddPhotoModalOpen(true);
  };

  const handleEditCommentClick = (album: Album) => {
    setSelectedAlbum(album);
    setEditCommentModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAlbum) return;

    setIsDeleting(true);
    try {
      await deleteAlbum(selectedAlbum.id);
      // アルバム一覧を再取得
      await loadData();
      // モーダルを閉じる
      setDeleteModalOpen(false);
      setSelectedAlbum(null);
    } catch (error) {
      console.error('アルバムの削除に失敗しました:', error);
      // エラーハンドリング（必要に応じてトースト表示等）
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedAlbum(null);
  };

  const handleAddPhotoSuccess = () => {
    // アルバム一覧を再取得
    loadData();
  };

  const handleAddPhotoClose = () => {
    setAddPhotoModalOpen(false);
    setSelectedAlbum(null);
  };

  const handleEditCommentSuccess = () => {
    // アルバム一覧を再取得
    loadData();
  };

  const handleEditCommentClose = () => {
    setEditCommentModalOpen(false);
    setSelectedAlbum(null);
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
            アルバム
          </h1>
          <p className="text-xl md:text-2xl text-[#F5F5DC] mb-3 max-w-3xl mx-auto">
            大切な思い出を保管し、特別な日に再び開きましょう。
          </p>
          <p className="text-xl md:text-2xl text-[#F5F5DC] mb-12 max-w-3xl mx-auto">
            しかし、開封後閲覧できるのは24時間だけです。
          </p>

          {/* 新規作成ボタン */}
          <button 
            onClick={handleCreateAlbum}
            className="bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] px-12 py-4 rounded-full font-bold text-xl shadow-xl hover:opacity-90 transition flex items-center gap-3 mx-auto"
          >
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
                  <h3 className="text-2xl font-bold text-[#D4AF37]">{stats.total}</h3>
                  <p className="text-[#F5F5DC]">作成済みアルバム</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl p-8 border border-[#D4AF37]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Lock className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-400">{stats.sealed}</h3>
                  <p className="text-[#F5F5DC]">未開封のアルバム</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl p-8 border border-[#D4AF37]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Unlock className="text-green-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-400">{stats.unlocked}</h3>
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

          {albums.length === 0 ? (
            /* 空の状態 */
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
              <button 
                onClick={handleCreateAlbum}
                className="bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] px-8 py-3 rounded-full font-bold hover:opacity-90 transition flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                アルバムを作成
              </button>
            </div>
          ) : (
            /* アルバム一覧 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album) => {
                const accessInfo = checkAlbumAccess(album);
                
                return (
                  <div key={album.id} className="group bg-gradient-to-br from-[#1A1A1A] to-[#232946] rounded-2xl border border-[#D4AF37]/20 overflow-hidden hover:border-[#D4AF37]/40 transition-colors">
                    {/* カードヘッダー */}
                    <div className="p-6 border-b border-[#D4AF37]/10">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2 flex-1 mr-4">
                          {album.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {accessInfo.status === 'sealed' && (
                            <button
                              onClick={() => handleEditCommentClick(album)}
                              className="w-8 h-8 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 rounded-full flex items-center justify-center text-[#D4AF37] hover:text-[#F5F5DC] transition-colors"
                              title="コメントを編集"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            accessInfo.status === 'sealed' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : accessInfo.status === 'unlocked'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {accessInfo.status === 'sealed' && <Lock size={12} />}
                            {accessInfo.status === 'unlocked' && <Unlock size={12} />}
                            {accessInfo.status === 'expired' && <Lock size={12} />}
                            {accessInfo.status === 'sealed' && '未開封'}
                            {accessInfo.status === 'unlocked' && '公開中'}
                            {accessInfo.status === 'expired' && '期限切れ'}
                          </div>
                          <button
                            onClick={() => handleDeleteClick(album)}
                            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                            title="アルバムを削除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* コメント表示 */}
                      {album.comment && (
                        <div className="mb-3 p-3 bg-[#0B192F]/50 rounded-lg border border-[#D4AF37]/10">
                          <p className="text-sm text-[#F5F5DC]/80 italic">
                            "{album.comment}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-[#F5F5DC]/60">
                        {accessInfo.status !== 'sealed' && (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            開封日: {album.unlock_date ? new Date(album.unlock_date).toLocaleDateString('ja-JP') : '-'}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <ImageIcon size={12} />
                          {album.photos?.length || 0}枚
                        </div>
                      </div>
                    </div>

                    {/* カードフッター */}
                    <div className="p-4">
                      {accessInfo.status === 'sealed' && (
                        <div className="text-center space-y-3">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleAddPhotoClick(album)}
                              className="flex-1 bg-[#0B192F] border border-[#D4AF37]/40 text-[#D4AF37] py-2 rounded-lg font-medium hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-2"
                            >
                              <Upload size={16} />
                              写真追加
                            </button>
                            <button 
                              onClick={() => handleUnsealAlbum(album.id)}
                              className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                              <Unlock size={16} />
                              開封
                            </button>
                          </div>
                          <p className="text-xs text-[#F5F5DC]/60">
                            開封すると24時間限定で閲覧できます
                          </p>
                        </div>
                      )}
                      
                      {accessInfo.status === 'unlocked' && (
                        <div className="space-y-2">
                          <div className="text-center text-[#F5F5DC]/70 text-sm">
                            残り時間: {Math.floor((accessInfo.timeRemaining || 0) / (1000 * 60 * 60))}時間 {Math.floor(((accessInfo.timeRemaining || 0) % (1000 * 60 * 60)) / (1000 * 60))}分
                          </div>
                          <button 
                            onClick={() => router.push(`/album/${album.id}`)}
                            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F5F5DC] text-[#0B192F] py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Eye size={16} />
                            アルバムを開く
                          </button>
                        </div>
                      )}
                      
                      {accessInfo.status === 'expired' && (
                        <div className="text-center">
                          <div className="text-[#F5F5DC]/70 text-sm mb-2">
                            24時間の公開期間が終了しました
                          </div>
                          <button disabled className="w-full bg-gray-600 text-gray-400 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2">
                            <Lock size={16} />
                            閲覧できません
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* アルバム作成モーダル */}
      <CreateAlbumModal 
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleAlbumCreated}
      />

      {/* アルバム削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        albumTitle={selectedAlbum?.title || ''}
        isDeleting={isDeleting}
      />

      {/* 写真追加モーダル */}
      <AddPhotoModal
        isOpen={addPhotoModalOpen}
        onClose={handleAddPhotoClose}
        albumId={selectedAlbum?.id || ''}
        albumTitle={selectedAlbum?.title || ''}
        onSuccess={handleAddPhotoSuccess}
      />

      {/* コメント編集モーダル */}
      <EditCommentModal
        isOpen={editCommentModalOpen}
        onClose={handleEditCommentClose}
        albumId={selectedAlbum?.id || ''}
        albumTitle={selectedAlbum?.title || ''}
        currentComment={selectedAlbum?.comment || null}
        onSuccess={handleEditCommentSuccess}
      />
    </main>
  );
}