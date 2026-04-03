import { createClient } from "@/lib/supabase/server"
import { generateRandomComment } from "@/lib/randomuser/comment"
import type { Memory } from "@/types"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ memories })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const image = formData.get("image") as File | null
  const title = formData.get("title") as string | null
  const song_name = formData.get("song_name") as string | null
  const artist = formData.get("artist") as string | null
  const spotify_embed_url = formData.get("spotify_embed_url") as string | null

  if (!image) {
    return Response.json({ error: "image is required" }, { status: 400 })
  }

  // Upload image to Supabase Storage
  const ext = image.name.split(".").pop() ?? "jpg"
  const path = `${user.id}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from("memory-images")
    .upload(path, image, { contentType: image.type, upsert: false })

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl: image_url } } = supabase.storage
    .from("memory-images")
    .getPublicUrl(path)

  // Generate random commenter + comment
  const { commenter_name, commenter_avatar_url, comment_text } =
    await generateRandomComment()

  // Insert memory row
  const { data: memory, error: insertError } = await supabase
    .from("memories")
    .insert({
      user_id: user.id,
      title: title || null,
      image_url,
      song_name: song_name || null,
      artist: artist || null,
      spotify_embed_url: spotify_embed_url || null,
      commenter_name,
      commenter_avatar_url,
      comment_text,
    })
    .select()
    .single()

  if (insertError) {
    await supabase.storage.from("memory-images").remove([path])
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  return Response.json({ memory: memory as Memory }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return Response.json({ error: "id is required" }, { status: 400 })

  // Fetch the memory first to get the image path
  const { data: memory, error: fetchError } = await supabase
    .from("memories")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !memory) {
    return Response.json({ error: "Memory not found" }, { status: 404 })
  }

  // Delete storage object
  const url = new URL(memory.image_url)
  const storagePath = url.pathname.split("/memory-images/")[1]
  if (storagePath) {
    await supabase.storage.from("memory-images").remove([storagePath])
  }

  // Delete DB row
  const { error: deleteError } = await supabase
    .from("memories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
