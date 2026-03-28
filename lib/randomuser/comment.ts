import { COMMENT_TEMPLATES } from "@/lib/constants/comments"

interface RandomCommenter {
  commenter_name: string
  commenter_avatar_url: string
  comment_text: string
}

function pickRandomComment(): string {
  return COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)]
}

export async function generateRandomComment(): Promise<RandomCommenter> {
  const comment_text = pickRandomComment()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const response = await fetch("https://randomuser.me/api/", {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) throw new Error("randomuser.me returned non-200")

    const data = await response.json()
    const user = data.results[0]
    const commenter_name = `${user.name.first} ${user.name.last}`
    const commenter_avatar_url = user.picture.thumbnail

    return { commenter_name, commenter_avatar_url, comment_text }
  } catch {
    return {
      commenter_name: "a friend",
      commenter_avatar_url: "/default-avatar.svg",
      comment_text,
    }
  }
}
