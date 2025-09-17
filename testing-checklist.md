## 動作テスト手順

### 1. 基本機能テスト

#### A. アルバム作成時のコメント機能
1. アプリケーションで新しいアルバムを作成
2. コメント欄に任意のテキストを入力
3. アルバムが正常に作成されることを確認
4. ダッシュボードでコメントが表示されることを確認

#### B. コメント編集機能（未開封時）
1. 未開封アルバムのコメント編集ボタンをクリック
2. コメントを変更して保存
3. 変更が反映されることを確認

#### C. 権限制御の確認
1. アルバムを開封する
2. 開封後はコメント編集ボタンが表示されないことを確認
3. 直接APIを叩いてもエラーになることを確認

### 2. Supabaseでの直接確認

```sql
-- SQL Editorで実行して確認
-- 1. 最新のアルバムデータを確認
SELECT id, title, comment, unlock_date, created_at 
FROM albums 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. コメント付きアルバムの統計
SELECT 
  COUNT(*) as total_albums,
  COUNT(comment) as albums_with_comment,
  COUNT(CASE WHEN unlock_date IS NULL THEN 1 END) as sealed_albums,
  COUNT(CASE WHEN unlock_date IS NULL AND comment IS NOT NULL THEN 1 END) as sealed_with_comment
FROM albums;

-- 3. 最長・最短コメントの確認
SELECT 
  title,
  LENGTH(comment) as comment_length,
  LEFT(comment, 50) as comment_preview
FROM albums 
WHERE comment IS NOT NULL
ORDER BY LENGTH(comment) DESC;
```

### 3. エラーケースのテスト

#### A. 長すぎるコメント
- 500文字を超えるコメントを入力して制限が効いているか確認

#### B. 開封済みアルバムでの編集試行
- 開封済みアルバムのコメント編集APIを直接呼び出してエラーになることを確認

#### C. 他ユーザーのアルバム編集試行
- 別ユーザーのアルバムIDでコメント編集を試行してエラーになることを確認

### 4. トラブルシューティング

#### よくある問題と解決方法:

**問題1: "column comment does not exist" エラー**
```sql
-- 解決: マイグレーションが実行されていない
ALTER TABLE albums ADD COLUMN comment TEXT;
```

**問題2: コメントが保存されない**
```sql
-- 確認: RLSポリシーが正しく動作しているか
SELECT * FROM albums WHERE user_id = auth.uid();
```

**問題3: 権限エラーが発生する**
```sql
-- 確認: ユーザーが正しく認証されているか
SELECT auth.uid(), auth.role();
```

### 5. パフォーマンステスト

#### 大量データでのテスト
```sql
-- テスト用データ作成（開発環境のみ）
INSERT INTO albums (user_id, title, comment, unlock_date)
SELECT 
  auth.uid(),
  'テストアルバム ' || generate_series,
  'これはテスト用のコメントです。番号: ' || generate_series,
  CASE WHEN generate_series % 3 = 0 THEN NOW() ELSE NULL END
FROM generate_series(1, 100);

-- クエリパフォーマンス確認
EXPLAIN ANALYZE 
SELECT id, title, comment, unlock_date 
FROM albums 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```