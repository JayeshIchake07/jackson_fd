"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import {
  getChatSession,
  sendChatMessage,
  setTypingStatus,
  addParticipant,
  getChatSuggestions,
  cannedResponses,
  type ChatMessage,
  type ChatSession,
} from "@/lib/chat"
import { getTicketById, addTicketComment, type Ticket } from "@/lib/tickets"
import { Send, Paperclip, Smile, MoreVertical, Sparkles, MessageSquare, Users, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface AgentChatPanelProps {
  ticketId: string
  onUpdate?: () => void
}

export function AgentChatPanel({ ticketId, onUpdate }: AgentChatPanelProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [session, setSession] = useState<ChatSession | null>(null)
  const [message, setMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const ticketData = getTicketById(ticketId)
    if (ticketData) {
      setTicket(ticketData)

      // Initialize chat session
      const chatSession = getChatSession(ticketId)
      if (user) {
        addParticipant(ticketId, user.id, user.name, user.role)
      }
      setSession(chatSession)
    }
  }, [ticketId, user])

  useEffect(() => {
    scrollToBottom()
  }, [session?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTyping = () => {
    if (user && session) {
      setTypingStatus(ticketId, user.id, true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(ticketId, user.id, false)
      }, 2000)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !session) return

    setIsSending(true)

    try {
      // Send chat message
      sendChatMessage(ticketId, user.id, user.name, user.role as any, message, isInternal)

      // Also add as ticket comment
      addTicketComment(ticketId, user.id, user.name, user.role, message)

      // Update session
      setSession(getChatSession(ticketId))
      setMessage("")
      setTypingStatus(ticketId, user.id, false)

      toast({
        title: "Message sent",
        description: isInternal ? "Internal note added" : "Message sent to user",
      })

      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleGetSuggestions = async () => {
    setShowSuggestions(true)
    const aiSuggestions = await getChatSuggestions(ticketId, ticket?.description || "")
    setSuggestions(aiSuggestions)
  }

  const applySuggestion = (suggestion: string) => {
    setMessage(suggestion)
    setShowSuggestions(false)
  }

  if (!ticket || !session) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Ticket Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{ticket.title}</CardTitle>
              <CardDescription>{ticket.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{ticket.status}</Badge>
              <Badge variant="outline">{ticket.priority}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Conversation</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleGetSuggestions}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Suggestions
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Canned Responses</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {cannedResponses.map((category) => (
                      <div key={category.category}>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          {category.category}
                        </DropdownMenuLabel>
                        {category.responses.map((response, index) => (
                          <DropdownMenuItem key={index} onClick={() => setMessage(response)}>
                            {response.substring(0, 40)}...
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                {session.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation with the user</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {session.messages.map((msg) => (
                      <ChatMessageBubble key={msg.id} message={msg} currentUserId={user?.id || ""} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}

                {/* Typing Indicator */}
                {session.typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span>Someone is typing...</span>
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI Suggestions</span>
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-2 bg-transparent"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="space-y-2">
                <Tabs value={isInternal ? "internal" : "public"} onValueChange={(v) => setIsInternal(v === "internal")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="public">Public Reply</TabsTrigger>
                    <TabsTrigger value="internal">Internal Note</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex gap-2">
                  <Textarea
                    placeholder={isInternal ? "Add an internal note..." : "Type your message..."}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    rows={3}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!message.trim() || isSending}>
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Participants */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-base">Participants</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {session.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{participant.role}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${participant.online ? "bg-green-500" : "bg-gray-500"}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle className="text-base">Ticket Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{format(ticket.createdAt, "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{format(ticket.updatedAt, "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Category</p>
                <Badge variant="outline" className="mt-1">
                  {ticket.category}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Source</p>
                <Badge variant="outline" className="mt-1">
                  {ticket.source}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface ChatMessageBubbleProps {
  message: ChatMessage
  currentUserId: string
}

function ChatMessageBubble({ message, currentUserId }: ChatMessageBubbleProps) {
  const isOwnMessage = message.senderId === currentUserId

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className={`space-y-1 ${isOwnMessage ? "items-end" : "items-start"}`}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{message.senderName}</span>
            <span>{format(message.timestamp, "h:mm a")}</span>
            {message.isInternal && (
              <Badge variant="secondary" className="text-xs">
                Internal
              </Badge>
            )}
          </div>
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwnMessage
                ? "bg-primary text-primary-foreground"
                : message.isInternal
                  ? "bg-yellow-500/10 border border-yellow-500/20"
                  : "bg-muted"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
