# User Actions / あなたにお願いしたい作業

アカウント所有者権限や秘密鍵が必要な作業です。こちらで実装は進めますが、以下はあなた側で順次お願いします。

## Supabase

1. publishable keyはローカルの`.env.local`に設定済みです。
2. 必要に応じて本番用キーへ差し替えてください。

```bash
EXPO_PUBLIC_SUPABASE_URL=https://doupguwwpshyjdhsfgtr.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabaseのpublishable key>
EXPO_PUBLIC_API_BASE_URL=<Edge FunctionまたはAPIのURL。未確定なら空でOK>
```

3. Supabase AuthでApple providerを有効化する。
4. Supabase AuthでGoogle providerを有効化する。
5. iOS/Androidのbundle idとredirect URLが確定したらSupabase Authへ追加する。
6. service role keyはアプリコードや`EXPO_PUBLIC_`に絶対に入れない。

## Apple

1. Apple Developer Accountを用意する。
2. iOS bundle identifier `app.dayby.mobile` を作成する。
3. Sign in with Appleを有効化する。
4. 後でTestFlight用にApp Store Connectを使える状態にする。

## Google

1. Google Cloud projectを用意する。
2. OAuth consent screenを設定する。
3. iOS / Android用OAuth clientを作成する。
4. Supabase AuthのGoogle providerへ必要なclient情報を入れる。

## Cloudflare R2

1. R2 bucket `dayby` はprivateのままにする。
2. 署名URL発行用のR2 access keyを作成する。
3. 作成した値はSupabase Edge Functionのsecretsに入れる。アプリ側には入れない。

必要なserver-side secrets:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=dayby
```

4. 選外動画の短期削除用lifecycle ruleは後で設定する。

## Expo / EAS

1. Expo accountを用意する。
2. app slug / ownerを決める。
3. iOS/AndroidのDevelopment Buildを作る段階でEAS setupを行う。

## GitHub

GitHub repository `axelrod-xx/dayby` はremote設定済みです。push前には必ず秘密情報スキャンと`git status --ignored`確認を行います。

## Values Needed Locally / ローカルに必要な値

取得できたら`.env.local`に入れてください。

```bash
EXPO_PUBLIC_SUPABASE_URL=https://doupguwwpshyjdhsfgtr.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_BASE_URL=
```

R2 secretsやSupabase service role keyは、モバイルアプリ用の`.env.local`に入れないでください。
