# User Actions / あなたにお願いしたい作業

このファイルは、アカウント所有者の操作や実機確認が必要なものだけをまとめます。
コード側で進められる作業はCodex側で進めます。

## いま優先して確認したいこと

### iOS実機テスト

最新のiOS development buildをiPhoneに入れて確認してください。
確認用URLは `docs/PROGRESS.md` の最新行を参照してください。

確認してほしい流れ:

1. 起動
2. Dev login または Apple / Google login
3. Profile setup
4. Group作成
5. Invite作成と共有文面
6. Cameraで10秒以内撮影
7. Trimで2秒選択、選択部分がわかるか
8. Post to Groups
9. Post Successから共有
10. Daily Reel / Bookmark / Monthly Memory
11. Notification permissionとPreview reminder

重点チェック:

- 画面が暗すぎないか
- 友達に見せても恥ずかしくないか
- Trimの操作が震えないか
- 投稿後に迷わず戻れるか
- 通知許可の出方が自然か
- Share文面が自然か

### Android実機テスト

Android端末でも同じ流れを確認してください。
Androidは特に以下を見てください。

- Camera権限
- Microphone権限
- Notification権限
- 10秒撮影
- Native trim
- Share sheet
- Android戻るボタン
- 画面端の余白やボタン切れ

## ログイン設定

Apple / Googleログインは本番前に正式設定が必要です。
開発中はDev loginを使えます。

```text
Email: dev@dayby.app
Password: dayby-dev-password
```

## R2 / Supabase

- R2 bucketはprivateのまま維持してください。
- R2 secretやSupabase service role keyはGitHubに入れません。
- 本番前に、画面共有で一度見えたR2 keyはローテーションしてください。

## 日本語・韓国語対応

UIが固まったら開始します。
順番:

1. 文字列をコードから辞書へ切り出す
2. Englishを基準言語にする
3. Japaneseを追加
4. Koreanを追加
5. 実機で長い文言の折り返し確認

## GitHubに絶対に上げないもの

- `.env.local`
- Supabase service role key
- R2 access key / secret access key
- Apple secret key
- Google client secret
- EAS credential raw files
