import { PlaybackProvider } from "@/contexts/PlaybackContext"
import { MemoriesProvider } from "@/contexts/MemoriesContext"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlaybackProvider>
      <MemoriesProvider>{children}</MemoriesProvider>
    </PlaybackProvider>
  )
}
