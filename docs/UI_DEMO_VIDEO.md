# Demo Video Direction

The signed-out Home should feel like a full-screen vertical memory preview, not an explanation page.

## Current MVP Approach

- Use an in-app pseudo video made from native views.
- Keep `dayby` as the main foreground brand.
- Rotate date, time, and author metadata every few seconds.
- Avoid showing a fake month or fake group name on Home.
- Keep the primary CTA at the bottom: `Start with friends`.

This lets us test the feeling without shipping a large video file or needing final brand footage.

## Later MP4 Approach

- Create a 9:16 MP4, 8 to 12 seconds, silent by default.
- Use original-looking everyday clips, not stock footage.
- Keep the footage soft and casual: food, street, classroom, train, sunset, friends walking.
- Overlay only subtle metadata in the app layer when possible.
- Export compressed H.264 around 720x1280 for the app bundle or remote CDN.
- Do not include music in the asset.

## Home Versus Monthly Memory

- Home demo: brand-first, `dayby` visible, no fake group/month emphasis.
- Monthly Memory: content-first, left top `OUR MAY` and group name, left bottom date/time/author, optional end card.
