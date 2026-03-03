# UGC Shipping Tracker

Internal tool by D-DOUBLEU MEDIA. Track UGC creator shipments, manage concepts, share progress with clients.

## Setup

1. Deploy to Vercel (connect this repo)
2. Create a Vercel KV store (see deploy guide)
3. Add environment variables:
   - `MANAGER_PIN` — any PIN your UGC manager will use to log in
   - KV variables are added automatically when you link the store
4. Redeploy

## How It Works

- **Manager view**: PIN-protected. Create clients, add concepts, update statuses, add tracking links.
- **Client view**: Public share link. Read-only progress view with tracking links. No login needed.
- **Tracking**: Paste any tracking number or 17track URL. Auto-links to 17track.net.
