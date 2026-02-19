import { SessionProvider } from "next-auth/react"
import Navbar from "@/Components/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/Components/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "VideoAssistant AI",
  description: "AI-powered searchable assistant for uploaded course videos",
};


export default function RootLayout({ children }) {
  return (
      

     
    <html lang="en">
      <SessionWrapper>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
   </SessionWrapper>
    </html>
  );
}
