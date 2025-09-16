import { supabase } from "./supabase";

export interface Album {
  id: string;
  user_id: string;
  title: string;
  unlock_date: string | null; // null = 未開封, 値あり = 開封済み
  created_at: string;
  updated_at: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  album_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  caption?: string;
  uploaded_at: string;
}

export interface CreateAlbumData {
  title: string;
}

// アルバムを作成
export async function createAlbum(data: CreateAlbumData): Promise<Album> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  console.log('Creating album for user:', user.id, 'with title:', data.title);

  // unlock_dateはnullに設定（未開封状態）
  const { data: album, error } = await supabase
    .from('albums')
    .insert({
      user_id: user.id,
      title: data.title,
      unlock_date: null, // 未開封状態
    })
    .select()
    .single();

  if (error) {
    console.error('Album creation error:', error);
    throw new Error(`アルバムの作成に失敗しました: ${error.message}`);
  }

  console.log('Album created successfully:', album);
  return album;
}

// ユーザーのアルバム一覧を取得
export async function getUserAlbums(): Promise<Album[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  console.log('Fetching albums for user:', user.id);

  // まずアルバムのみを取得
  const { data: albums, error } = await supabase
    .from('albums')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getUserAlbums error:', error);
    throw new Error(`アルバムの取得に失敗しました: ${error.message}`);
  }

  console.log('Albums fetched successfully:', albums);

  // 各アルバムに写真データを追加
  const albumsWithPhotos = await Promise.all(
    (albums || []).map(async (album) => {
      const { data: photos } = await supabase
        .from('photos')
        .select('id, file_name')
        .eq('album_id', album.id);
      
      return {
        ...album,
        photos: photos || []
      };
    })
  );

  return albumsWithPhotos;
}

// 特定のアルバムを取得
export async function getAlbum(albumId: string): Promise<Album> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  const { data: album, error } = await supabase
    .from('albums')
    .select(`
      *,
      photos:photos(*)
    `)
    .eq('id', albumId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(`アルバムの取得に失敗しました: ${error.message}`);
  }

  return album;
}

// アルバムを更新
export async function updateAlbum(albumId: string, data: Partial<CreateAlbumData>): Promise<Album> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  const { data: album, error } = await supabase
    .from('albums')
    .update(data)
    .eq('id', albumId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`アルバムの更新に失敗しました: ${error.message}`);
  }

  return album;
}

// アルバムを削除
// アルバムを削除（修正版）
export async function deleteAlbum(albumId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");

  // 1. アルバムの所有者確認
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('user_id')
    .eq('id', albumId)
    .single();

  if (albumError || !album) {
    throw new Error("アルバムが見つかりません");
  }

  if (album.user_id !== user.id) {
    throw new Error("このアルバムを削除する権限がありません");
  }

  // 2. 関連する写真のファイルパスを取得
  const { data: photos } = await supabase
    .from('photos')
    .select('file_path')
    .eq('album_id', albumId);

  // 3. 写真レコードを先に削除
  if (photos && photos.length > 0) {
    const { error: photosDeleteError } = await supabase
      .from('photos')
      .delete()
      .eq('album_id', albumId);

    if (photosDeleteError) {
      throw new Error(`写真の削除に失敗しました: ${photosDeleteError.message}`);
    }
  }

  // 4. アルバムレコードを削除
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`アルバムの削除に失敗しました: ${error.message}`);
  }

  // 5. 最後にStorageからファイルを削除
  if (photos && photos.length > 0) {
    const filePaths = photos.map(p => p.file_path);
    const { error: storageError } = await supabase.storage
      .from('public-photos')
      .remove(filePaths);
    
    if (storageError) {
      console.error('Storage file deletion failed:', storageError);
      // Storageの削除エラーは致命的ではないのでログのみ
    }
  }
}

// アルバムを開封（24時間カウントダウン開始）
export async function unsealAlbum(albumId: string): Promise<Album> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // 現在時刻をunlock_dateに設定
  const now = new Date();
  
  const { data: album, error } = await supabase
    .from('albums')
    .update({ unlock_date: now.toISOString() })
    .eq('id', albumId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`アルバムの開封に失敗しました: ${error.message}`);
  }

  return album;
}

// アルバムのアクセス可能性をチェック（24時間制限ロジック）
export function checkAlbumAccess(album: Album): {
  canAccess: boolean;
  status: 'sealed' | 'unlocked' | 'expired';
  timeRemaining?: number;
} {
  // unlock_dateがnullの場合は未開封状態
  if (!album.unlock_date) {
    return {
      canAccess: false,
      status: 'sealed', // 未開封
    };
  }

  const now = new Date();
  const unlockDate = new Date(album.unlock_date);
  const unlockEnd = new Date(unlockDate.getTime() + 24 * 60 * 60 * 1000); // 24時間後

  if (now >= unlockDate && now < unlockEnd) {
    return {
      canAccess: true,
      status: 'unlocked',
      timeRemaining: unlockEnd.getTime() - now.getTime(),
    };
  } else {
    return {
      canAccess: false,
      status: 'expired',
    };
  }
}

// アルバム統計を取得（簡略版）
export async function getAlbumStats(): Promise<{
  total: number;
  sealed: number;
  unlocked: number;
  expired: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  const { data: albums, error } = await supabase
    .from('albums')
    .select('unlock_date')
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`統計の取得に失敗しました: ${error.message}`);
  }

  // クライアント側で24時間制限ロジックを計算
  const now = new Date();
  const stats = albums.reduce(
    (acc, album) => {
      acc.total++;
      
      // unlock_dateがnullの場合は未開封
      if (!album.unlock_date) {
        acc.sealed++;
        return acc;
      }

      const unlockDate = new Date(album.unlock_date);
      const unlockEnd = new Date(unlockDate.getTime() + 24 * 60 * 60 * 1000);

      if (now >= unlockDate && now < unlockEnd) {
        acc.unlocked++;
      } else {
        acc.expired++;
      }
      return acc;
    },
    { total: 0, sealed: 0, unlocked: 0, expired: 0 }
  );

  return stats;
}