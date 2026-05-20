# dayby

Shoot 10 sec.  
Keep 2 sec.  
Your month becomes 1 minute.

dayby is a private group memory app. Friends capture one short moment each day, vote on the 2 seconds worth keeping, and turn the month into a quiet 1-minute memory.

## Product Principles

1. We don't choose the song.
2. We don't over-edit the memory.
3. We help friends keep the moments that matter.
4. The final emotion belongs to the users.

## Non-Negotiables

- Upload only the trimmed 2-second video.
- Never store the original 10-second capture on the server.
- Do not build in-app BGM, song recommendations, or a music library.
- Do not add a constant watermark to the main video body.
- Do not build a public social feed, chat, followers, or like rankings.
- Default monthly highlight/ranking behavior is off per group.
- Store video files in Cloudflare R2, not Supabase Storage.
- Keep Supabase RLS enabled from the beginning.

## Current Status

Foundation in progress:

- Expo + TypeScript + Expo Router scaffolded.
- Project documentation is maintained under `docs/`.
- External services are new and still need to be created.

## Documentation

- [Product Spec](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [RLS Policy](docs/RLS.md)
- [Roadmap](docs/ROADMAP.md)
- [Progress](docs/PROGRESS.md)
- [Development Setup](docs/DEVELOPMENT.md)
- [External Services](docs/EXTERNAL_SERVICES.md)
- [Decisions](docs/DECISIONS.md)
- [User Actions](docs/USER_ACTIONS.md)

## Local Commands

```bash
npm install
npm run start
npm run ios
npm run android
npm run web
```

Use Expo development builds for native video processing work. Expo Go is useful for simple UI checks, but it is not the target runtime for dayby.
