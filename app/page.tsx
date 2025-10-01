"use client"

import { LoginForm } from "@/components/auth/login-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  return (
    <main>
      <AuthWrapper />
    </main>
  )
}

function AuthWrapper() {
  const { user } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return (
    <>
      <DashboardLayout />
      <ChatbotWidget />
    </>
  )
}
