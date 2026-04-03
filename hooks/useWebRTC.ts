"use client"

import { useRef, useState, useCallback } from "react"
import type { SongIdentificationResult } from "@/types"

type Status = "idle" | "connecting" | "listening" | "identifying" | "done" | "error"

export interface WebRTCLog {
  ts: number
  text: string
  type: "info" | "success" | "error"
}

const NULL_RESULT: SongIdentificationResult = { song_name: null, artist: null, spotify_embed_url: null }

interface UseWebRTCReturn {
  status: Status
  logs: WebRTCLog[]
  start: () => Promise<void>
  stopAudio: () => void
  cancel: () => void
}

export function useWebRTC(
  onResult: (result: SongIdentificationResult) => void
): UseWebRTCReturn {
  const [status, setStatus] = useState<Status>("idle")
  const [logs, setLogs] = useState<WebRTCLog[]>([])

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const cancelledRef = useRef(false)

  function pushLog(text: string, type: WebRTCLog["type"] = "info") {
    setLogs((prev) => [...prev, { ts: Date.now(), text, type }])
  }

  const cancel = useCallback(() => {
    cancelledRef.current = true
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    recorderRef.current = null
    streamRef.current = null
    chunksRef.current = []
    setStatus("idle")
    setLogs([])
  }, [])

  const stopAudio = useCallback(() => {
    if (status !== "listening") return
    recorderRef.current?.stop()
  }, [status])

  const start = useCallback(async () => {
    cancelledRef.current = false
    setStatus("connecting")
    setLogs([])

    try {
      pushLog("Requesting microphone access…")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      pushLog("Microphone ready — start humming", "success")

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())

        // Don't identify if the user cancelled
        if (cancelledRef.current) return

        setStatus("identifying")
        pushLog("Recording stopped — sending to OpenAI…")

        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
          const arrayBuffer = await blob.arrayBuffer()
          const bytes = new Uint8Array(arrayBuffer)
          let binary = ""
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
          const audio = btoa(binary)
          const format = recorder.mimeType.split("/")[1]?.split(";")[0] ?? "webm"

          pushLog("Identifying song…")
          const res = await fetch("/api/identify-song", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio, format }),
          })

          const data = await res.json()
          if (data.song_name) {
            pushLog(`Found: "${data.song_name}" by ${data.artist}`, "success")
            onResult({ song_name: data.song_name, artist: data.artist, spotify_embed_url: null })
          } else {
            pushLog("Could not identify the song", "error")
            onResult(NULL_RESULT)
          }
          setStatus("done")
        } catch {
          pushLog("Identification failed — enter song manually", "error")
          onResult(NULL_RESULT)
          setStatus("idle")
        }
      }

      recorder.start()
      setStatus("listening")
      pushLog("Recording — hum or sing the melody", "success")
    } catch {
      pushLog("Microphone access denied", "error")
      onResult(NULL_RESULT)
      setStatus("idle")
    }
  }, [onResult])

  return { status, logs, start, stopAudio, cancel }
}
