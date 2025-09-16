-- 開発環境用：完全リセットスクリプト
-- 注意: 本番環境では絶対に実行しないでください！
-- すべてのデータが削除されます。

-- Step 1: 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own albums" ON albums;
DROP POLICY IF EXISTS "Users can insert their own albums" ON albums;
DROP POLICY IF EXISTS "Users can update their own albums" ON albums;
DROP POLICY IF EXISTS "Users can delete their own albums" ON albums;

DROP POLICY IF EXISTS "Users can view photos in their albums" ON photos;
DROP POLICY IF EXISTS "Users can insert photos in their albums" ON photos;
DROP POLICY IF EXISTS "Users can update photos in their albums" ON photos;
DROP POLICY IF EXISTS "Users can delete photos in their albums" ON photos;

DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Step 2: トリガーと関数を削除
DROP TRIGGER IF EXISTS update_albums_updated_at ON albums;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Step 3: インデックスを削除
DROP INDEX IF EXISTS idx_albums_user_id;
DROP INDEX IF EXISTS idx_albums_unlock_date;
DROP INDEX IF EXISTS idx_albums_status;
DROP INDEX IF EXISTS idx_photos_album_id;

-- Step 4: テーブルを削除
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS albums;

-- Step 5: ストレージバケットを削除（必要に応じて）
-- DELETE FROM storage.buckets WHERE id = 'album-photos';

-- 完了メッセージ
SELECT 'All tables and policies dropped successfully!' as message;
SELECT 'Now you can run the full database-schema.sql script.' as next_step;