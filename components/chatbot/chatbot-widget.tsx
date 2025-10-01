"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import {
  getChatbotSession,
  sendChatbotMessage,
  clearChatbotSession,
  type ChatbotMessage,
  type ChatbotSession,
} from "@/lib/chatbot"
import { createTicket } from "@/lib/tickets"
import { Bot, Send, X, Minimize2, Maximize2, Loader2, Sparkles, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function ChatbotWidget() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [session, setSession] = useState<ChatbotSession | null>(null)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && isOpen) {
      setSession(getChatbotSession(user.id))
    }
  }, [user, isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [session?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !session) return

    const userMessage = message
    setMessage("")
    setIsTyping(true)

    try {
      await sendChatbotMessage(user.id, userMessage)
      setSession(getChatbotSession(user.id))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage()
  }

  const handleActionClick = async (action: any) => {
    if (!user) return

    switch (action.type) {
      case "create_ticket":
        createTicket({
          title: `Chatbot Request: ${action.data.category}`,
          description: "Created via AI chatbot",
          category: action.data.category,
          priority: action.data.priority,
          status: "open",
          source: "chatbot",
          submittedBy: user.id,
        })
        toast({
          title: "Ticket created",
          description: "Your support ticket has been created successfully",
        })
        break

      case "resolve":
        if (action.data.url) {
          window.open(action.data.url, "_blank")
        }
        break

      case "escalate":
        createTicket({
          title: "Escalated from Chatbot",
          description: "User requested human assistance",
          category: "other",
          priority: action.data.priority,
          status: "open",
          source: "chatbot",
          submittedBy: user.id,
        })
        toast({
          title: "Escalated to agent",
          description: "An agent will contact you shortly",
        })
        break

      case "search_kb":
        // Navigate to knowledge base
        toast({
          title: "Opening knowledge base",
          description: "Searching for relevant articles...",
        })
        // Dispatch custom event to navigate to knowledge base
        window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'knowledge' }))
        break
    }
  }

  const handleReset = () => {
    if (user) {
      clearChatbotSession(user.id)
      setSession(getChatbotSession(user.id))
      toast({
        title: "Chat reset",
        description: "Starting a new conversation",
      })
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">AI Support Assistant</CardTitle>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-73px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {session?.messages.map((msg) => (
              <ChatbotMessageBubble
                key={msg.id}
                message={msg}
                onSuggestionClick={handleSuggestionClick}
                onActionClick={handleActionClick}
              />
            ))}

            {isTyping && (
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isTyping}
              />
              <Button onClick={handleSendMessage} disabled={!message.trim() || isTyping} size="icon">
                {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Powered by AI</span>
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs">
                Reset Chat
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface ChatbotMessageBubbleProps {
  message: ChatbotMessage
  onSuggestionClick: (suggestion: string) => void
  onActionClick: (action: any) => void
}

function ChatbotMessageBubble({ message, onSuggestionClick, onActionClick }: ChatbotMessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
        )}
        <div className="space-y-2">
          <div className={`rounded-lg px-4 py-2 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onSuggestionClick(suggestion)}
                  className="text-xs h-7"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {/* Actions */}
          {message.actions && message.actions.length > 0 && (
            <div className="space-y-2">
              {message.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="default"
                  size="sm"
                  onClick={() => onActionClick(action)}
                  className="w-full justify-between text-xs h-8"
                >
                  <span>{action.label}</span>
                  {action.type === "resolve" && <ExternalLink className="h-3 w-3" />}
                  {action.type === "create_ticket" && <Sparkles className="h-3 w-3" />}
                </Button>
              ))}
            </div>
          )}

          <span className="text-xs text-muted-foreground">{format(message.timestamp, "h:mm a")}</span>
        </div>
      </div>
    </div>
  )
}
