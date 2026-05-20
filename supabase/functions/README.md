# Supabase Edge Functions

## R2 Upload URL

`r2-upload-url` returns a short-lived signed R2 PUT URL for a 2-second MP4.

Required server-side secrets:

```bash
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=dayby
```

Deploy later:

```bash
supabase functions deploy r2-upload-url
supabase functions deploy r2-download-url
```

Do not deploy until R2 secrets are set in the Supabase project.

## Security Notes

- R2 keys are server-only.
- The mobile app receives only short-lived signed URLs.
- MVP upload accepts only `video/mp4`.
- MVP upload rejects files above 3MB to keep close to the 1MB target while allowing some encoding variance.
