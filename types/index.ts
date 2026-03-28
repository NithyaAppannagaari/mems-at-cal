export interface Memory {
  id: string
  user_id: string
  title: string | null
  image_url: string
  song_name: string | null
  artist: string | null
  spotify_embed_url: string | null
  commenter_name: string
  commenter_avatar_url: string
  comment_text: string
  created_at: string
}

export interface SongIdentificationResult {
  song_name: string | null
  artist: string | null
  spotify_embed_url: string | null
}

export interface UploadFormData {
  imageFile: File
  songResult: SongIdentificationResult | null
}
