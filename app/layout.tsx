import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import Navbar from "@/components/Navbar"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ducky",
  description:
    "Power your server with Ducky, a multipurpose bot focused on seamlessly integrating Discord and ERLC server automation for effortless management.",
  icons: {
    icon: "/assets/Ducky.svg",
  },
}

export const viewport = {
  themeColor: "#F7E82D",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Providers>
          <Navbar />
          <div id="page-content">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
