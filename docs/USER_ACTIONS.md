# User Actions / あなたにお願いしたい確認

このファイルは、コードでは完了できない実機確認と外部アカウント設定だけをまとめます。

## iOS実機テスト

最新のiOS development buildをiPhoneに入れて確認してください。確認用URLは `docs/PROGRESS.md` と `docs/EXTERNAL_SERVICES.md` の最新行を見ます。

確認してほしい流れ:

1. 起動
2. Dev login、またはApple / Google login
3. Profile setup
4. Group作成
5. Invite作成と共有文面
6. Cameraで10秒以内の撮影
7. Trimで2秒選択
8. Post to Groups
9. Post Successから共有
10. Daily Reel / Bookmark / Monthly Memory
11. Exportで端末に保存、または共有

重点チェック:

- 画面が暗すぎないか
- 友達に見せても恥ずかしくないか
- Trim操作が震えないか
- 投稿後に迷わず戻れるか
- Share文面が自然か
- 月間は「1分で届く」感覚になっているか

## Android実機テスト

Android端末でも同じ流れを確認してください。Androidでは特に以下を見ます。

- Camera権限
- Microphone権限
- 10秒撮影
- Native trim
- Share sheet
- Android戻るボタン
- 画面端の余白やボタン切れ

## ログイン設定

Apple / Googleログインは本番前に正式設定が必要です。開発中はDev loginを使えます。

```text
Email: dev@dayby.app
Password: dayby-dev-password
```

## 通知

通知はMVP実機レビューから外しています。Apple Push Notifications capabilityを有効化してiOS Ad Hoc profileを再生成した後に、静かなリマインダーとして戻します。

## R2 / Supabase

- R2 bucketはprivateのまま維持してください。
- R2 secretやSupabase service role keyをGitHubに入れないでください。
- 本番前に、セットアップ時に一度見えたR2 tokenをローテーションしてください。

## GitHubに絶対に上げないもの

- `.env.local`
- Supabase service role key
- R2 access key / secret access key
- Apple secret key
- Google client secret
- EAS credential raw files
