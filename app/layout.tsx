import type { Metadata } from "next"
import { Afacad_Flux } from "next/font/google"
import "./globals.css"

const afacadFlux = Afacad_Flux({
  variable: "--font-afacad",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
})

export const metadata: Metadata = {
  title: "memories @ cal",
  description: "A place to keep what matters",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${afacadFlux.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  )
}
