"use client"

import { useRef, useState, useCallback } from "react"
import type { SongIdentificationResult } from "@/types"

type Status = "idle" | "connecting" | "listening" | "identifying" | "done" | "error"

interface UseWebRTCReturn {
  status: Status
  start: () => Promise<void>
  stop: () => void
  error: string | null
}

export function useWebRTC(
  onResult: (result: SongIdentificationResult) => void
): UseWebRTCReturn {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stop = useCallback(() => {
    dcRef.current?.close()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    dcRef.current = null
    streamRef.current = null
    pcRef.current = null
    setStatus("idle")
  }, [])

  const start = useCallback(async () => {
    setStatus("connecting")
    setError(null)

    try {
      // 1. Fetch ephemeral token from our server
      const tokenRes = await fetch("/api/realtime-token", { method: "POST" })
      if (!tokenRes.ok) throw new Error("Failed to get realtime token")
      const { client_secret } = await tokenRes.json()

      // 2. Create peer connection
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // 3. Data channel (must be created before offer)
      const dc = pc.createDataChannel("oai-events")
      dcRef.current = dc

      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)

          if (msg.type === "response.done") {
            setStatus("done")
            const textContent = msg.response?.output?.[0]?.content?.find(
              (c: { type: string }) => c.type === "text"
            )
            if (textContent?.text) {
              const parsed = JSON.parse(textContent.text) as {
                song_name: string | null
                artist: string | null
              }
              onResult({ ...parsed, spotify_embed_url: null })
            } else {
              onResult({ song_name: null, artist: null, spotify_embed_url: null })
            }
            stop()
          } else if (msg.type === "input_audio_buffer.speech_started") {
            setStatus("listening")
          } else if (msg.type === "response.creating") {
            setStatus("identifying")
          }
        } catch {
          // ignore non-JSON messages
        }
      }

      dc.onerror = () => {
        setError("Connection error. Please try again.")
        setStatus("error")
        stop()
      }

      // 4. Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      // 5. Create SDP offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 6. Send offer to OpenAI Realtime
      const sdpRes = await fetch(
        "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${client_secret}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        }
      )

      if (!sdpRes.ok) throw new Error("OpenAI WebRTC handshake failed")

      const answerSdp = await sdpRes.text()
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp })

      setStatus("listening")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
      setStatus("error")
      stop()
    }
  }, [onResult, stop])

  return { status, start, stop, error }
}
