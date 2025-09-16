-- 現在のデータベース構造を新しい仕様に更新
-- Supabase SQL Editorで以下を順番に実行してください

-- Step 1: 現在の構造を確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'albums' 
ORDER BY ordinal_position;

-- Step 2: 不要な'説明'(description)カラムを削除
ALTER TABLE albums DROP COLUMN IF EXISTS description;

-- Step 3: unlock_dateの制約を変更
-- まずNOT NULL制約を削除
ALTER TABLE albums ALTER COLUMN unlock_date DROP NOT NULL;

-- Step 4: unlock_dateの型をDATEからTIMESTAMP WITH TIME ZONEに変更
ALTER TABLE albums ALTER COLUMN unlock_date TYPE TIMESTAMP WITH TIME ZONE USING unlock_date::timestamp with time zone;

-- Step 5: photosテーブルに不足カラムを追加
ALTER TABLE photos ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE photos ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS caption TEXT;

-- Step 6: photosテーブルのカラム名を変更（必要に応じて）
-- URLカラムがfile_pathでない場合
-- ALTER TABLE photos RENAME COLUMN url TO file_path;

-- Step 7: 作成_atカラム名を英語に変更（必要に応じて）
-- ALTER TABLE photos RENAME COLUMN 作成_at TO uploaded_at;

-- Step 8: インデックスを作成
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_unlock_date ON albums(unlock_date);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);

-- Step 9: 更新後の構造を確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'albums' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'photos' 
ORDER BY ordinal_position;

-- 完了メッセージ
SELECT 'Database migration completed!' as status;