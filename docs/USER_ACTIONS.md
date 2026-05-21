# User Actions / あなたにお願いしたい作業

このファイルは、アカウント所有者権限や実機が必要な作業だけをまとめます。
こちらで進められる実装は止めず、外部サービスや端末操作が必要なものだけここに残します。

## 今すぐ必要

### iOS Development Build

現在、iOS実機用のEAS development buildを対話モードで進行中です。

進め方:

1. Apple Developer Program License Agreementが出た場合は同意する
2. Distribution Certificateは新規作成済みで問題なし
3. Ad Hoc build対象端末で手元のiPhoneを選択する
4. EAS buildがキューに入ったら、build URLまたはエラー全文を共有する

ビルドコマンド:

```bash
npx eas-cli build --profile development --platform ios
```

補足:

- 以前のNee用証明書を再利用しなくても問題ありません。
- daybyは新規Bundle ID `app.dayby.mobile` のまま進めます。
- 古いNee関連のEAS/Apple資格情報は、daybyの実機確認後に整理でOKです。

### Android実機確認

Android端末が手元に戻ったら、development APKをインストールして確認してください。

Android APK:

```text
https://expo.dev/artifacts/eas/a2HhNgdv8TMoGhhCXwZKxE.apk
```

最初に確認する流れ:

1. APKをインストール
2. daybyを開く
3. 開発ログインで入る
4. Profileを作る
5. Groupを作る
6. Cameraで10秒以内を撮る
7. Trimで `Process 2 sec` を押す
8. `2-second file ready` が出るか確認

## 後で必要

### Supabase Auth

ログイン面は後回しにしています。リリース前に必須です。

Apple provider:

- `Client IDs`: `app.dayby.mobile`
- `Secret Key (for OAuth)`: Web OAuthを使う場合のみJWT形式のclient secretが必要
- Native iOSログイン中心なら、初期検証では空のまま進められる可能性があります
- `Allow users without an email`: OFF

Google provider:

- Google CloudでiOS / Android向けOAuth Client IDを作る
- Supabase AuthのGoogle providerへ正しいClient IDを入れる
- `app.dayby.mobile` はGoogle Client IDではないので入れない
- `Allow users without an email`: OFF
- iOSネイティブログインでnonce問題が出た場合のみ `Skip nonce checks` を検討

### R2 Key Rotation

開発用のR2キーは一度画面共有に表示されているため、本番前に必ずローテーションしてください。

方針:

- R2 bucketはprivateのまま
- アプリにR2秘密鍵は入れない
- Supabase Edge Function secretsにだけ設定する
- 本番前に古いR2 tokenを削除する

### R2 Upload有効化

実機でネイティブ2秒トリムが確認できるまで、R2アップロードは無効のままです。

有効化条件:

1. iOSまたはAndroidのdevelopment buildで2秒MP4生成を確認
2. 投稿画面で10秒元動画がアップロードされないことを確認
3. `EXPO_PUBLIC_ENABLE_R2_UPLOADS=true` をEAS envに設定
4. signed URLでR2へPUTできることを確認

### Apple / Google Production Login

開発ログインは `.env.local` / EAS development / preview だけで使います。
productionでは必ず無効化します。

```bash
EXPO_PUBLIC_ENABLE_DEV_AUTH=false
```

## 完了済み

- Supabase project `dayby` 作成済み
- Cloudflare R2 bucket `dayby` 作成済み
- R2 server-side secretsをSupabase Edge Functionsへ登録済み
- GitHub repository `axelrod-xx/dayby` 作成済み
- Expo/EAS project `@ryoaxelrod/dayby` 作成済み
- Android development build作成済み
- iOS simulator build作成済み
- iOS Bundle ID `app.dayby.mobile` 登録済み

## 絶対にGitHubへ上げないもの

- `.env.local`
- Supabase service role key
- R2 access key / secret access key
- Apple secret key
- Google client secret
- EAS credential raw files
