"use client"

import { useRef, useState, useCallback } from "react"

type AgentStatus = "idle" | "connecting" | "listening" | "speaking" | "error"

export function VoiceAgent() {
  const [status, setStatus] = useState<AgentStatus>("idle")
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)

  const tearDown = useCallback(() => {
    dcRef.current?.close()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    audioElRef.current?.remove()
    dcRef.current = null
    streamRef.current = null
    pcRef.current = null
    audioElRef.current = null
    setStatus("idle")
  }, [])

  const start = useCallback(async () => {
    setStatus("connecting")
    try {
      const tokenRes = await fetch("/api/voice-agent-token", { method: "POST" })
      if (!tokenRes.ok) { setStatus("error"); return }
      const { client_secret } = await tokenRes.json()

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // Play audio from the model through the browser speakers
      const audioEl = document.createElement("audio")
      audioEl.autoplay = true
      audioElRef.current = audioEl
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0] }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          tearDown()
        }
      }

      const dc = pc.createDataChannel("oai-events")
      dcRef.current = dc

      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === "response.audio.delta") setStatus("speaking")
          else if (msg.type === "response.audio.done") setStatus("listening")
          else if (msg.type === "input_audio_buffer.speech_started") setStatus("listening")
        } catch { /* ignore */ }
      }

      dc.onopen = () => setStatus("listening")
      dc.onerror = () => tearDown()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      stream.getTracks().forEach((t) => pc.addTrack(t, stream))

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

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

      if (!sdpRes.ok) { tearDown(); return }

      const answerSdp = await sdpRes.text()
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp })
    } catch {
      tearDown()
    }
  }, [tearDown])

  function handleClick() {
    if (status === "idle" || status === "error") start()
    else tearDown()
  }

  const isActive = status !== "idle" && status !== "error"

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <button
        onClick={handleClick}
        aria-label={isActive ? "End voice conversation" : "Start voice conversation"}
        className={[
          "relative w-10 h-10 rounded-full border flex items-center justify-center transition-all",
          status === "connecting"
            ? "border-[var(--muted)] opacity-60 cursor-wait"
            : status === "listening"
            ? "border-[var(--foreground)] bg-[var(--foreground)]/10"
            : status === "speaking"
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : status === "error"
            ? "border-red-400"
            : "border-[var(--border)] hover:border-[var(--foreground)]/40",
        ].join(" ")}
      >
        {status === "listening" && (
          <span className="absolute inset-0 rounded-full animate-ping border border-[var(--foreground)] opacity-20" />
        )}
        {status === "speaking" && (
          <span className="absolute inset-0 rounded-full animate-ping border border-[var(--accent)] opacity-30" />
        )}

        {/* Mic icon when idle/listening, waveform when speaking, X when connecting */}
        {status === "speaking" ? (
          <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        ) : (
          <svg
            className={["w-4 h-4", isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"].join(" ")}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 8a1 1 0 0 1 1 1 8 8 0 0 1-7 7.938V22h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.062A8 8 0 0 1 4 12a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
          </svg>
        )}
      </button>

      {isActive && (
        <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-[var(--muted)]">
          {status === "connecting" ? "connecting…" : status === "speaking" ? "speaking" : "listening"}
        </span>
      )}
    </div>
  )
}
