import { supabase } from "./supabase";
import { Photo } from "./albums";

export interface UploadPhotoData {
  albumId: string;
  file: File;
  caption?: string;
}

// 写真をアップロード
export async function uploadPhoto(data: UploadPhotoData): Promise<Photo> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // アルバムの存在確認と所有者チェック、および未開封チェック
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('user_id, unlock_date')
    .eq('id', data.albumId)
    .single();

  if (albumError || !album) {
    throw new Error("アルバムが見つかりません");
  }

  if (album.user_id !== user.id) {
    throw new Error("このアルバムにアクセスする権限がありません");
  }

  // 未開封のアルバムにのみ写真を追加可能
  if (album.unlock_date !== null) {
    throw new Error("開封済みのアルバムには写真を追加できません");
  }

  // ファイル名を生成（ユーザーID/アルバムID/ランダムID_元のファイル名）
  const fileExtension = data.file.name.split('.').pop();
  const fileName = `${user.id}/${data.albumId}/${crypto.randomUUID()}.${fileExtension}`;

  // ファイルをStorage にアップロード（パブリックバケット使用）
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('public-photos')
    .upload(fileName, data.file);

  if (uploadError) {
    console.error("Upload Error 詳細:", uploadError);
    throw new Error(`ファイルのアップロードに失敗しました: ${uploadError.message}`);
  }

  // データベースに写真情報を保存
  const { data: photo, error: dbError } = await supabase
    .from('photos')
    .insert({
      album_id: data.albumId,
      file_path: uploadData.path,
      file_name: data.file.name,
      file_size: data.file.size,
      caption: data.caption,
    })
    .select()
    .single();

  if (dbError) {
    // データベース保存に失敗した場合、アップロードしたファイルを削除
    await supabase.storage
      .from('public-photos')
      .remove([fileName]);
    
    throw new Error(`写真情報の保存に失敗しました: ${dbError.message}`);
  }

  return photo;
}

// 写真のURLを取得（認証済みURL）
export async function getPhotoUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from('public-photos')
    .createSignedUrl(filePath, 60 * 60); // 1時間有効

  if (data?.signedUrl) {
    return data.signedUrl;
  }
  
  // フォールバック: パブリックURL（開発用）
  const { data: publicData } = supabase.storage
    .from('public-photos')
    .getPublicUrl(filePath);
    
  return publicData.publicUrl;
}

// 写真を削除
export async function deletePhoto(photoId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // まず写真情報を取得してファイルパスを確認
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('file_path, album_id')
    .eq('id', photoId)
    .single();

  if (fetchError) {
    throw new Error(`写真が見つかりません: ${fetchError.message}`);
  }

  // アルバムの所有者確認
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('user_id')
    .eq('id', photo.album_id)
    .eq('user_id', user.id)
    .single();

  if (albumError) {
    throw new Error("アクセス権限がありません");
  }

  // データベースから写真情報を削除
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (dbError) {
    throw new Error(`写真情報の削除に失敗しました: ${dbError.message}`);
  }

  // Storageからファイルを削除
  const { error: storageError } = await supabase.storage
    .from('public-photos')
    .remove([photo.file_path]);

  if (storageError) {
    console.error('Storage file deletion failed:', storageError);
    // Storageの削除に失敗してもエラーにしない（ファイルが既に存在しない可能性があるため）
  }
}

// 写真のキャプションを更新
export async function updatePhotoCaption(photoId: string, caption: string): Promise<Photo> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // まず写真の存在とアクセス権限を確認
  const { data: existingPhoto, error: fetchError } = await supabase
    .from('photos')
    .select(`
      *,
      albums!inner(user_id)
    `)
    .eq('id', photoId)
    .single();

  if (fetchError || !existingPhoto) {
    throw new Error("写真が見つかりません");
  }

  if (existingPhoto.albums.user_id !== user.id) {
    throw new Error("アクセス権限がありません");
  }

  const { data: photo, error } = await supabase
    .from('photos')
    .update({ caption })
    .eq('id', photoId)
    .select()
    .single();

  if (error) {
    throw new Error(`キャプションの更新に失敗しました: ${error.message}`);
  }

  return photo;
}

// アルバムの写真一覧を取得
export async function getAlbumPhotos(albumId: string): Promise<Photo[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("認証が必要です");
  }

  // アルバムの所有者確認
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('user_id')
    .eq('id', albumId)
    .eq('user_id', user.id)
    .single();

  if (albumError) {
    throw new Error("アクセス権限がありません");
  }

  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('uploaded_at', { ascending: true });

  if (error) {
    throw new Error(`写真の取得に失敗しました: ${error.message}`);
  }

  return photos || [];
}

// ファイルサイズとタイプのバリデーション
export function validatePhotoFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'ファイルサイズは10MB以下にしてください',
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'JPEG、PNG、WebP形式の画像ファイルのみアップロード可能です',
    };
  }

  return { isValid: true };
}