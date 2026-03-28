const SYSTEM_PROMPT = `You are a song identification assistant. The user will hum or sing a melody.
Respond with ONLY this JSON, nothing else:
{"song_name": "Song Title", "artist": "Artist Name"}
If you cannot identify it: {"song_name": null, "artist": null}
Do not include any explanation, preamble, or text outside the JSON.`

export async function createRealtimeToken(): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "alloy",
      instructions: SYSTEM_PROMPT,
      input_audio_format: "pcm16",
      output_audio_format: "pcm16",
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 800,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI realtime session error: ${err}`)
  }

  const data = await response.json()
  return data.client_secret.value
}
