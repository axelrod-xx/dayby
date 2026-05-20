# User Actions / あなたにお願いしたい作業

このファイルは、アカウント所有者権限や秘密情報が必要な作業だけをまとめます。
こちらで実装を進められるものは進め、止まるものだけここに残します。

## Supabase

現在のプロジェクト:

- Project: `dayby`
- URL: `https://doupguwwpshyjdhsfgtr.supabase.co`
- Local env: `.env.local` に publishable key 設定済み

お願いしたいこと:

1. Supabase Auth の Apple provider を有効化する
2. Supabase Auth の Google provider を有効化する
3. service role key はアプリコード、GitHub、`EXPO_PUBLIC_` には絶対に入れない

Apple provider の入力方針:

- `Client IDs`: `app.dayby.mobile`
- `Secret Key (for OAuth)`: ネイティブiOSログインだけなら空でよい
- `Allow users without an email`: OFF

Google provider の入力方針:

- `Client IDs`: Google Cloud で作成した OAuth Client ID を入れる
- 例: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- `app.dayby.mobile` は Client ID ではないので入れない
- `Client Secret`: ネイティブ iOS/Android クライアントだけなら空でよい
- `Skip nonce checks`: iOS Google ネイティブログインで必要なら ON
- `Allow users without an email`: OFF

## Apple

1. Apple Developer Account を用意する
2. Bundle ID `app.dayby.mobile` を作成する
3. Sign in with Apple を有効化する
4. TestFlight / App Store Connect の準備を進める

## Google

1. Google Cloud project を用意する
2. OAuth consent screen を設定する
3. iOS 用 OAuth Client ID を作成する
   - Bundle ID: `app.dayby.mobile`
4. Android 用 OAuth Client ID は development build の SHA-1 が確定してから追加する
5. 作成した Client ID を Supabase Auth Google provider に入れる

## Cloudflare R2

現在の bucket:

- Bucket: `dayby`
- 推奨: private bucket + signed URL

お願いしたいこと:

1. R2 の server-side access key を作成する
2. 下記を Supabase Edge Function の secrets に設定する
3. アプリ側 `.env.local` や GitHub には入れない

必要な server-side secrets:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=dayby
```

## Expo / EAS

1. Expo account を用意する
2. EAS development build を iOS / Android 両方で作成する
3. ネイティブカメラ、Appleログイン、Googleログイン、動画トリミングは実機または dev build で確認する

## GitHub

Repository:

- `axelrod-xx/dayby`

こちらで push 前に必ず確認すること:

- `.env.local` を stage しない
- service role key / R2 secret / Apple secret / Google secret を commit しない
- `git status --short --ignored` で ignore 状態を確認する

## 開発中の一時対応

Apple / Google 設定が完了するまで、ローカルだけで使える開発用メールログインを有効化しています。

```bash
EXPO_PUBLIC_ENABLE_DEV_AUTH=true
```

この値は `.env.local` のみで使い、本番や GitHub には入れません。
