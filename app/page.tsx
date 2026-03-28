import { AuthCard } from "@/components/auth/AuthCard"

// Auth redirect (/ → /app when logged in) is handled by proxy.ts
export default function AuthPage() {
  return <AuthCard />
}

