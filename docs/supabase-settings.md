# Supabase 設定ガイド

## 確認メールを無効にする設定

1. **Supabase Dashboard** にアクセス
2. **Authentication > Settings** に移動
3. 以下の設定を変更：

### Email Settings
- **Enable email confirmations**: ❌ **無効**
- **Enable email change confirmations**: ❌ **無効** 
- **Enable password change confirmations**: ❌ **無効**

### Security Settings
- **Enable phone confirmations**: ❌ **無効**

### Advanced Settings
- **Disable signup**: ❌ **無効**（サインアップを許可）

## 設定後の動作
- 新規登録時に確認メールが送信されなくなります
- ユーザーは登録と同時にログイン状態になります
- より簡単なユーザー登録フローを提供できます

## 注意事項
- 本番環境では、セキュリティを考慮して確認メールを有効にすることを推奨します
- 開発・テスト環境では無効にして開発効率を向上させることができます