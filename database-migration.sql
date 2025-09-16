-- 既存のテーブルを新しい仕様に更新するためのマイグレーション
-- 
-- 実行前の準備：
-- 1. 既存データのバックアップを取ることを推奨します
-- 2. このスクリプトは段階的に実行してください

-- Step 1: 既存のalbumsテーブルの構造を確認
-- 以下をSQL Editorで実行して現在の構造を確認してください：
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'albums';

-- Step 2: 不要なカラムを削除（もし存在する場合）
DO $$
BEGIN
    -- statusカラムが存在する場合は削除
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'albums' AND column_name = 'status') THEN
        ALTER TABLE albums DROP COLUMN status;
    END IF;
    
    -- descriptionカラムが存在する場合は削除
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'albums' AND column_name = 'description') THEN
        ALTER TABLE albums DROP COLUMN description;
    END IF;
END $$;

-- Step 3: unlock_dateカラムの型を変更（DATE → TIMESTAMP WITH TIME ZONE, NULL可能）
DO $$
BEGIN
    -- unlock_dateカラムが存在する場合は型を変更
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'albums' AND column_name = 'unlock_date') THEN
        -- 既存のunlock_dateがNOT NULLの場合、まずNULL可能にする
        ALTER TABLE albums ALTER COLUMN unlock_date DROP NOT NULL;
        
        -- DATEからTIMESTAMP WITH TIME ZONEに変更
        ALTER TABLE albums ALTER COLUMN unlock_date TYPE TIMESTAMP WITH TIME ZONE USING unlock_date::timestamp with time zone;
    ELSE
        -- unlock_dateカラムが存在しない場合は追加
        ALTER TABLE albums ADD COLUMN unlock_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Step 4: 既存のデータをクリア（開発環境の場合）
-- 注意: 本番環境では実行しないでください！
-- DELETE FROM photos;
-- DELETE FROM albums;

-- Step 5: インデックスの再作成
DROP INDEX IF EXISTS idx_albums_status;
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_unlock_date ON albums(unlock_date);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);

-- Step 6: 確認クエリ
-- 以下をSQL Editorで実行して変更を確認してください：
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'albums' ORDER BY ordinal_position;

-- 完了メッセージ
SELECT 'Migration completed successfully!' as message;