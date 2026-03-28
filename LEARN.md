# memories @ cal — Deep Dive Learning Guide

A comprehensive walkthrough of how this app is built, covering Next.js app structure, Supabase, REST APIs, and the OpenAI Voice Agent. Every code example comes directly from this codebase.

---

## Table of Contents

1. [Next.js App Structure](#1-nextjs-app-structure)
2. [Supabase 101](#2-supabase-101)
3. [REST API Calls](#3-rest-api-calls)
4. [OpenAI Voice Agent — Deep Dive](#4-openai-voice-agent--deep-dive)

---

## 1. Next.js App Structure

### What is the App Router?

Next.js 13+ introduced the **App Router**, which replaces the older `pages/` directory. Everything lives under `app/`. The file system IS the router — the folder name becomes the URL path.

```
app/
  layout.tsx        →  wraps every page (persistent shell)
  page.tsx          →  renders at "/"
  dashboard/
    page.tsx        →  renders at "/dashboard"
    layout.tsx      →  wraps only /dashboard routes
  api/
    memories/
      route.ts      →  API endpoint at "/api/memories"
    spotify/
      route.ts      →  API endpoint at "/api/spotify"
    realtime-token/
      route.ts      →  API endpoint at "/api/realtime-token"
```

### Server vs. Client Components

This is the most important mental model shift in the App Router.

| | Server Component | Client Component |
|---|---|---|
| Runs on | Server only | Browser |
| Can use | `async/await`, databases, secrets | React state, event handlers, browser APIs |
| Declare with | Nothing (default) | `"use client"` at top of file |
| Can fetch secrets | Yes | No — never put API keys here |

**Rule of thumb:** Start every component as a server component. Add `"use client"` only when you need `useState`, `useEffect`, event handlers, or browser APIs like `navigator.mediaDevices`.

In this app:
- `app/page.tsx` — server component (no state needed, just renders `<AuthCard>`)
- `app/dashboard/page.tsx` — client component (`"use client"`) because it manages upload state and toasts
- `components/upload/HumRecorder.tsx` — client component (uses mic, browser APIs)
- `lib/supabase/server.ts` — server-only (uses `cookies()` from `next/headers`)

### The Layout File

`app/layout.tsx` is the root shell that wraps every page. It's a great place for global fonts, metadata, and providers.

```tsx
// app/layout.tsx
import { Space_Grotesk, Fraunces } from "next/font/google"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default function RootLayout({ children }) {
  return (
    <html className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

`next/font/google` downloads fonts at build time and injects them as CSS variables — no external font requests at runtime.

### Nested Layouts

`app/dashboard/layout.tsx` only wraps the `/dashboard` route tree. Useful for adding a sidebar, nav, or providers scoped to one section.

### The `proxy.ts` File (aka Middleware)

In Next.js, **middleware** runs before every request — before pages render, before API routes execute. It's the right place to check auth and redirect.

In this project, Next.js 16 uses `proxy.ts` instead of `middleware.ts`, and exports `proxy()` instead of `middleware()`. The logic is the same:

```ts
// proxy.ts
export async function proxy(request: NextRequest) {
  // Check if the user has a valid Supabase session
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in and trying to access /app/* → send to login
  if (request.nextUrl.pathname.startsWith("/app") && !user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Already logged in and on login page → send to dashboard
  if (request.nextUrl.pathname === "/" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/", "/app/:path*"],  // only run on these routes
}
```

**Why do redirects here instead of in the page?**
With `cacheComponents: true` in `next.config.ts`, page server components are pre-rendered. If you put `redirect()` inside `app/page.tsx`, Next.js tries to run it during build and throws a prerender error. `proxy.ts` runs at request time, so it's safe.

### Key Next.js 16 Constraints in This App

```ts
// next.config.ts
cacheComponents: true   // ← THIS BREAKS `export const dynamic`
```

- Do NOT write `export const dynamic = "force-dynamic"` in any page/route
- Always `await cookies()` — the cookies API is async in Next.js 16
- Auth redirect logic lives in `proxy.ts`, not inside page components

### The `@/` Path Alias

```ts
import { createClient } from "@/lib/supabase/client"
```

`@/` resolves to the project root. Configured in `tsconfig.json`. It means you never write `../../../lib/supabase/client` — just `@/lib/supabase/client` from anywhere.

### Project Directory Map

```
app/                    Next.js pages and API routes
  api/                  Server-side API endpoints
  dashboard/            The main app page (/dashboard)
  layout.tsx            Root HTML shell + fonts
  page.tsx              Auth page (/)
  globals.css           Tailwind base + CSS variables

components/             UI components (all "use client")
  auth/                 Login/signup form
  gallery/              Memory card grid
  layout/               App header
  slideshow/            Slideshow viewer
  ui/                   Generic atoms (Button, Spinner, Toast)
  upload/               Photo + hum recording panel

contexts/               React Context providers
hooks/                  Custom React hooks
lib/                    Pure utility/integration code (no React)
  openai/               Realtime token creation
  randomuser/           Random commenter generation
  spotify/              Spotify search + auth
  supabase/             Client and server Supabase factories
  utils/                Misc helpers
types/                  Shared TypeScript interfaces
proxy.ts                Next.js middleware (auth redirects)
```

---

## 2. Supabase 101

### What is Supabase?

Supabase is an **open-source Firebase alternative** that gives you:

| Service | What it does |
|---|---|
| **Auth** | Email/password, OAuth, magic links — full user management |
| **Database** | PostgreSQL — fully relational, SQL, row-level security |
| **Storage** | File storage (images, videos) with access policies |
| **Realtime** | WebSocket subscriptions to database changes |
| **Edge Functions** | Serverless functions (like Deno/Cloudflare Workers) |

### Relational vs. Non-Relational

**Supabase uses PostgreSQL — it is fully relational.**

| Feature | Supabase (Postgres) | Firebase (Firestore) |
|---|---|---|
| Data model | Tables, rows, columns | Collections, documents |
| Relationships | Foreign keys, JOINs | Manual references |
| Queries | SQL | Limited query API |
| Schema | Enforced, typed | Flexible, schemaless |
| Transactions | Full ACID | Limited |

In this app, the `memories` table has a `user_id` column that is a foreign key to Supabase Auth's `auth.users` table. That's a relational pattern.

### The `memories` Table Schema

```sql
CREATE TABLE memories (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) NOT NULL,
  title               text,
  image_url           text NOT NULL,
  song_name           text,
  artist              text,
  spotify_embed_url   text,
  commenter_name      text NOT NULL,
  commenter_avatar_url text NOT NULL,
  comment_text        text NOT NULL,
  created_at          timestamptz DEFAULT now()
);
```

### Row-Level Security (RLS)

This is Supabase's superpower. RLS policies are SQL rules that run automatically on every query — even if your app code has a bug, users can never read each other's data.

```sql
-- Users can only see their own memories
CREATE POLICY "Users can read own memories"
  ON memories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own memories
CREATE POLICY "Users can insert own memories"
  ON memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

`auth.uid()` is a Supabase function that returns the ID of the currently authenticated user. The policy is evaluated per-row, per-request.

### Two Supabase Clients: Browser vs. Server

Supabase provides different clients depending on where your code runs. This app has two factory functions:

#### Browser Client — `lib/supabase/client.ts`

```ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
```

- Used in React components with `"use client"`
- Reads the auth session from a browser cookie automatically
- Uses `NEXT_PUBLIC_` env vars (safe to expose — these are public keys, not secrets)

#### Server Client — `lib/supabase/server.ts`

```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()  // async in Next.js 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- Used in API routes and server components
- Manually wires the cookie store so it can read/write the session token from HTTP cookies
- `await cookies()` — required in Next.js 16 because request APIs are now async

**Why two clients?** The browser has `document.cookie`; the server has `next/headers`. The `@supabase/ssr` package provides adapters for both, letting auth sessions work seamlessly across environments.

### Auth in This App

**Sign up / Sign in** — `components/auth/AuthForm.tsx`

```ts
const supabase = createClient()  // browser client

// Sign in
const { error } = await supabase.auth.signInWithPassword({ email, password })

// Sign up
const { error } = await supabase.auth.signUp({ email, password })
```

After sign-in, Supabase sets a session cookie. The proxy middleware reads it on every request to decide whether to allow or redirect.

**Checking auth in an API route**

```ts
// app/api/memories/route.ts
const supabase = await createClient()  // server client
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return Response.json({ error: "Unauthorized" }, { status: 401 })
}
```

Every protected API route does this exact pattern. `getUser()` re-validates the token with Supabase's servers — it's not just reading the cookie, it's a real auth check.

### Querying the Database

```ts
// SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC
const { data: memories, error } = await supabase
  .from("memories")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
```

The Supabase JS client uses a **query builder** — each method chains onto a query. Common methods:

| Method | SQL equivalent |
|---|---|
| `.from("table")` | `FROM table` |
| `.select("col1, col2")` | `SELECT col1, col2` |
| `.eq("col", value)` | `WHERE col = value` |
| `.order("col", { ascending: false })` | `ORDER BY col DESC` |
| `.insert({ ... })` | `INSERT INTO ...` |
| `.single()` | Expects exactly one row |

### Inserting a Row

```ts
const { data: memory, error: insertError } = await supabase
  .from("memories")
  .insert({
    user_id: user.id,
    title: title || null,
    image_url,
    song_name: song_name || null,
    // ...
  })
  .select()   // return the inserted row
  .single()   // unwrap from array to single object
```

### File Storage

```ts
// Upload a file
const { error: uploadError } = await supabase.storage
  .from("memory-images")        // bucket name
  .upload(path, file, {
    contentType: file.type,
    upsert: false,              // fail if path already exists
  })

// Get its public URL
const { data: { publicUrl } } = supabase.storage
  .from("memory-images")
  .getPublicUrl(path)
```

Storage buckets in Supabase work like S3. Each bucket has its own access policy (public read, authenticated upload, etc). The path is `{user_id}/{timestamp}.{ext}` — namespacing by user so paths don't collide.

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- `NEXT_PUBLIC_` prefix → included in browser bundle (safe, these are public)
- Without `NEXT_PUBLIC_` → server only (for actual secrets like `OPENAI_API_KEY`)

---

## 3. REST API Calls

### What is a Next.js Route Handler?

A file at `app/api/[route]/route.ts` becomes a serverless API endpoint. You export named functions matching HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, etc.

```ts
// app/api/memories/route.ts

export async function GET() {     // handles GET /api/memories
  // ...
}

export async function POST(request: Request) {  // handles POST /api/memories
  // ...
}
```

These run on the server — you can safely use API keys, database queries, etc.

### Pattern: Auth-Gated API Route

Every API route in this app follows the same guard pattern:

```ts
export async function POST(request: Request) {
  // 1. Create server Supabase client
  const supabase = await createClient()

  // 2. Verify the session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 3. Do the actual work...
  // 4. Return a response
  return Response.json({ result }, { status: 200 })
}
```

### Returning Responses

Next.js Route Handlers use the Web standard `Response` object:

```ts
// JSON response
return Response.json({ memories })

// JSON with status code
return Response.json({ error: "Not found" }, { status: 404 })

// Created (201)
return Response.json({ memory }, { status: 201 })
```

### Parsing Request Bodies

**JSON body:**
```ts
const body = await request.json()
const { song_name, artist } = body
```

**Form data (multipart — for file uploads):**
```ts
const formData = await request.formData()
const image = formData.get("image") as File | null
const title = formData.get("title") as string | null
```

### Calling Your Own API from the Client

From a React component, use the browser's `fetch()`:

```ts
// Simple JSON POST
const res = await fetch("/api/spotify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ song_name, artist }),
})
const data = await res.json()

// Multipart form POST (for file uploads — no Content-Type header needed)
const fd = new FormData()
fd.append("image", imageFile)
fd.append("title", "My memory")

const res = await fetch("/api/memories", { method: "POST", body: fd })
const { memory } = await res.json()
```

**Why use your own API routes instead of calling external APIs directly from the client?**
- Your secret API keys stay on the server
- You can validate and transform data before sending it
- You can attach auth checks — the Spotify and OpenAI routes both verify the user session first

### The Three API Routes in This App

#### `GET /api/memories`
Fetches all memories for the logged-in user from Supabase Postgres.

#### `POST /api/memories`
1. Receives a `multipart/form-data` request with image + metadata
2. Uploads the image to Supabase Storage
3. Gets the image's public URL
4. Calls `randomuser.me` to generate a fake commenter
5. Inserts a new row in the `memories` table
6. Returns the created memory object

#### `POST /api/spotify`
1. Receives `{ song_name, artist }` JSON
2. Calls Spotify's API to search for a matching track
3. Returns the Spotify embed URL (or null if not found)

#### `POST /api/realtime-token`
1. Verifies the user is logged in
2. Calls OpenAI's `/v1/realtime/sessions` endpoint with the secret `OPENAI_API_KEY`
3. Returns a **short-lived ephemeral token** that the browser can use directly
4. The real API key never leaves the server

### Calling External APIs from Route Handlers

```ts
// lib/openai/realtimeToken.ts
const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,  // secret, server only
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ model: "gpt-4o-realtime-preview-2024-12-17", ... }),
})
const data = await response.json()
return data.client_secret.value
```

This is the standard pattern: your route handler acts as a **proxy**, adding your secret credentials before forwarding to the third-party API.

---

## 4. OpenAI Voice Agent — Deep Dive

### What Problem Are We Solving?

The app lets you hum a melody and identifies the song. This requires:
1. Capturing real-time audio from the microphone
2. Streaming it to an AI model that can understand audio
3. Getting back a structured response (song name + artist)

Standard REST APIs (request → wait → response) are too slow and don't support streaming audio. The OpenAI Realtime API uses **WebRTC** for low-latency, bidirectional audio streaming.

### What is WebRTC?

**WebRTC (Web Real-Time Communication)** is a browser standard originally built for video calls. It creates a direct peer-to-peer connection for streaming media. Key concepts:

| Term | Meaning |
|---|---|
| `RTCPeerConnection` | The connection object — manages the WebRTC session |
| `RTCDataChannel` | A bidirectional message channel over the WebRTC connection |
| SDP Offer/Answer | The negotiation handshake — each peer describes their capabilities |
| ICE Candidates | Network path candidates used to establish the connection |
| MediaStream | Audio/video data from the browser (microphone, camera) |
| VAD | Voice Activity Detection — detects when speech starts/stops |

### The Ephemeral Token Pattern

You cannot put your OpenAI API key in client-side code — it would be visible to anyone. The solution is an **ephemeral token**:

```
Browser                    Your Server               OpenAI
  |                             |                       |
  |  POST /api/realtime-token   |                       |
  |─────────────────────────────>                       |
  |                             |  POST /v1/realtime/sessions  |
  |                             |  Authorization: Bearer OPENAI_API_KEY
  |                             |─────────────────────────────>
  |                             |   { client_secret: "ephemeral-token-xyz" }
  |                             |<─────────────────────────────
  |  { client_secret: "..." }   |                       |
  |<─────────────────────────────                       |
  |                             |                       |
  |  Use token directly with OpenAI WebRTC              |
  |─────────────────────────────────────────────────────>
```

The ephemeral token is short-lived (typically 1 minute) and scoped — it can't be used for anything except the Realtime API. Your actual API key is never exposed.

### The Full WebRTC Handshake, Step by Step

The entire flow lives in `hooks/useWebRTC.ts`. Here's what happens when you click the mic button:

#### Step 1 — Fetch the Ephemeral Token
```ts
const tokenRes = await fetch("/api/realtime-token", { method: "POST" })
const { client_secret } = await tokenRes.json()
```

This hits your server, which validates your Supabase session, then calls OpenAI with your real API key and returns the short-lived token.

#### Step 2 — Create a Peer Connection
```ts
const pc = new RTCPeerConnection()
```

`RTCPeerConnection` is the core WebRTC object. It manages the entire connection lifecycle — ICE negotiation, DTLS handshake, media streams.

#### Step 3 — Create a Data Channel
```ts
const dc = pc.createDataChannel("oai-events")
```

A **data channel** lets you send/receive arbitrary JSON messages over the WebRTC connection — separate from the audio stream. OpenAI uses this channel to send structured events back (song identification result, speech detection, etc.).

**Critical:** The data channel must be created *before* the SDP offer, so it's included in the negotiation.

#### Step 4 — Attach Audio from the Microphone
```ts
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
stream.getTracks().forEach((track) => pc.addTrack(track, stream))
```

`getUserMedia` asks the user for mic permission and returns a `MediaStream`. Adding the tracks to the peer connection tells WebRTC to include your audio in the stream.

#### Step 5 — Create an SDP Offer
```ts
const offer = await pc.createOffer()
await pc.setLocalDescription(offer)
```

**SDP (Session Description Protocol)** is a text format that describes the connection: what codecs are supported, what media tracks exist, what network addresses to try. The "offer" is your side saying "here's what I can do."

#### Step 6 — Send the Offer to OpenAI
```ts
const sdpRes = await fetch(
  "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${client_secret}`,  // ephemeral token
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  }
)
const answerSdp = await sdpRes.text()
await pc.setRemoteDescription({ type: "answer", sdp: answerSdp })
```

This is the "SDP exchange." You send your offer to OpenAI's server; it returns an "answer" SDP describing OpenAI's side. Once both sides have set their local and remote descriptions, WebRTC knows how to connect.

After `setRemoteDescription`, the WebRTC connection establishes itself automatically.

### The Session Configuration

When your server creates the session token, it configures the AI's behavior:

```ts
// lib/openai/realtimeToken.ts
body: JSON.stringify({
  model: "gpt-4o-realtime-preview-2024-12-17",
  voice: "alloy",
  instructions: SYSTEM_PROMPT,         // what the AI should do
  input_audio_format: "pcm16",         // raw PCM audio in
  output_audio_format: "pcm16",        // raw PCM audio out
  turn_detection: {
    type: "server_vad",                // server-side voice activity detection
    threshold: 0.5,                    // how sensitive (0-1)
    prefix_padding_ms: 300,            // include 300ms before speech detected
    silence_duration_ms: 800,          // wait 800ms of silence before responding
  },
})
```

**Server VAD (Voice Activity Detection):** OpenAI's server listens to your audio stream and automatically detects when you start and stop speaking. You don't have to press a button when done — it just figures it out. The `silence_duration_ms: 800` means after 800ms of silence, it considers you done and starts generating the response.

**The system prompt** constrains the output format:

```ts
const SYSTEM_PROMPT = `You are a song identification assistant. The user will hum or sing a melody.
Respond with ONLY this JSON, nothing else:
{"song_name": "Song Title", "artist": "Artist Name"}
If you cannot identify it: {"song_name": null, "artist": null}
Do not include any explanation, preamble, or text outside the JSON.`
```

Forcing JSON-only output means the response is always machine-parseable.

### Handling Events from the Data Channel

OpenAI sends structured events over the data channel as the session progresses:

```ts
dc.onmessage = (event) => {
  const msg = JSON.parse(event.data)

  if (msg.type === "input_audio_buffer.speech_started") {
    // User has started speaking — update UI
    setStatus("listening")
  }

  if (msg.type === "response.creating") {
    // OpenAI is processing — update UI
    setStatus("identifying")
  }

  if (msg.type === "response.done") {
    // Response is complete
    const textContent = msg.response?.output?.[0]?.content?.find(
      (c) => c.type === "text"
    )
    if (textContent?.text) {
      const parsed = JSON.parse(textContent.text)
      // parsed = { song_name: "Bohemian Rhapsody", artist: "Queen" }
      onResult({ ...parsed, spotify_embed_url: null })
    }
    stop()  // clean up the connection
  }
}
```

The `response.done` event contains the final model output. The text content is the JSON string you prompted for, which you then parse into `{ song_name, artist }`.

### Cleanup

```ts
const stop = useCallback(() => {
  dcRef.current?.close()                              // close data channel
  streamRef.current?.getTracks().forEach(t => t.stop()) // release microphone
  pcRef.current?.close()                              // close peer connection
}, [])
```

Always clean up WebRTC resources — open mic tracks keep the browser's recording indicator active and consume battery.

### State Machine

The hook exposes a `status` that drives the UI:

```
idle → connecting → listening → identifying → done
                ↓                    ↓
              error               error
```

| Status | Meaning |
|---|---|
| `idle` | Not started |
| `connecting` | Fetching token + establishing WebRTC |
| `listening` | Connected, VAD heard speech starting |
| `identifying` | Silence detected, AI is processing |
| `done` | Got result |
| `error` | Something failed |

### The Component Tree

```
UploadPanel
  └── HumRecorder          (renders the mic button + status label)
        └── useWebRTC()    (all the WebRTC logic — no UI)
              └── /api/realtime-token  (server route — issues ephemeral token)
                    └── lib/openai/realtimeToken.ts  (calls OpenAI API)
```

`HumRecorder` is a thin UI wrapper. `useWebRTC` is a pure logic hook — you could attach it to any UI component. This separation makes each piece testable and reusable.

### Why WebRTC Instead of WebSockets?

| | WebRTC | WebSocket |
|---|---|---|
| Latency | Very low (optimized for real-time media) | Low |
| Audio streaming | Native support, codec-optimized | Manual chunking |
| Packet loss | Tolerant (designed for it) | Retransmits (bad for audio) |
| Setup | Complex SDP negotiation | Simple handshake |
| Use case | Voice/video | Chat, live data |

For humming a melody in real time, WebRTC's media-optimized transport is the right tool.

### What Happens After Song Identification

Once `onResult` fires in `HumRecorder`, the result bubbles up to `UploadPanel`:

```ts
// UploadPanel.tsx
const handleSongIdentified = useCallback(async (result) => {
  if (result.song_name && result.artist) {
    // Hit our Spotify API route to find the embed URL
    const res = await fetch("/api/spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song_name: result.song_name, artist: result.artist }),
    })
    const data = await res.json()
    setSongResult({ ...result, spotify_embed_url: data.spotify_embed_url })
  }
}, [])
```

The app takes the identified song → searches Spotify → stores the embed URL → when you save the memory, the embed URL is stored in Postgres → rendered as an `<iframe>` in the memory card.

---

## Quick Reference: Data Flow Summary

```
User hums
  → HumRecorder click
  → useWebRTC.start()
  → POST /api/realtime-token          (server validates session, issues ephemeral token)
  → WebRTC connection to OpenAI       (audio streams directly from browser to OpenAI)
  → VAD detects silence               (server-side, automatic)
  → OpenAI generates JSON response    (song name + artist)
  → data channel message → onResult
  → POST /api/spotify                 (find Spotify embed URL)
  → User clicks "Save memory"
  → POST /api/memories (multipart)    (upload image → Supabase Storage)
                                      (insert row → Supabase Postgres)
  → Memory appears in grid
```
