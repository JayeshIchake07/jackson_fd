// Real-time chat and collaboration system
export interface ChatMessage {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  senderRole: "agent" | "employee" | "admin"
  message: string
  timestamp: Date
  isInternal: boolean
  attachments?: string[]
}

export interface ChatSession {
  ticketId: string
  participants: Array<{
    id: string
    name: string
    role: string
    online: boolean
  }>
  messages: ChatMessage[]
  typingUsers: string[]
}

// Mock chat sessions
const mockChatSessions: Map<string, ChatSession> = new Map()

export const getChatSession = (ticketId: string): ChatSession => {
  if (!mockChatSessions.has(ticketId)) {
    mockChatSessions.set(ticketId, {
      ticketId,
      participants: [],
      messages: [],
      typingUsers: [],
    })
  }
  return mockChatSessions.get(ticketId)!
}

export const sendChatMessage = (
  ticketId: string,
  senderId: string,
  senderName: string,
  senderRole: "agent" | "employee" | "admin",
  message: string,
  isInternal = false,
): ChatMessage => {
  const session = getChatSession(ticketId)

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    ticketId,
    senderId,
    senderName,
    senderRole,
    message,
    timestamp: new Date(),
    isInternal,
  }

  session.messages.push(newMessage)
  return newMessage
}

export const setTypingStatus = (ticketId: string, userId: string, isTyping: boolean) => {
  const session = getChatSession(ticketId)

  if (isTyping) {
    if (!session.typingUsers.includes(userId)) {
      session.typingUsers.push(userId)
    }
  } else {
    session.typingUsers = session.typingUsers.filter((id) => id !== userId)
  }
}

export const addParticipant = (ticketId: string, userId: string, userName: string, userRole: string, online = true) => {
  const session = getChatSession(ticketId)

  if (!session.participants.find((p) => p.id === userId)) {
    session.participants.push({
      id: userId,
      name: userName,
      role: userRole,
      online,
    })
  }
}

export const updateParticipantStatus = (ticketId: string, userId: string, online: boolean) => {
  const session = getChatSession(ticketId)
  const participant = session.participants.find((p) => p.id === userId)

  if (participant) {
    participant.online = online
  }
}

// AI-powered chat suggestions
export const getChatSuggestions = async (ticketId: string, context: string): Promise<string[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const suggestions = [
    "I've reviewed your issue and I'm working on a solution.",
    "Could you provide more details about when this started happening?",
    "I've escalated this to our senior team for faster resolution.",
    "This should be resolved now. Can you please verify?",
    "I've found a similar issue in our knowledge base. Let me share the solution.",
  ]

  return suggestions.slice(0, 3)
}

// Canned responses for common scenarios
export const cannedResponses = [
  {
    category: "Greeting",
    responses: [
      "Hello! I'm here to help you with your issue.",
      "Hi there! Thanks for reaching out. Let me look into this for you.",
      "Good day! I've received your ticket and I'm on it.",
    ],
  },
  {
    category: "Investigation",
    responses: [
      "I'm currently investigating this issue. I'll update you shortly.",
      "Let me check our systems to understand what's happening.",
      "I'm looking into this now. Thank you for your patience.",
    ],
  },
  {
    category: "Resolution",
    responses: [
      "I've resolved the issue. Please let me know if you need anything else.",
      "This should be fixed now. Can you confirm it's working on your end?",
      "The problem has been addressed. Feel free to reach out if you have any questions.",
    ],
  },
  {
    category: "Follow-up",
    responses: [
      "Just checking in - is everything working as expected?",
      "Have you had a chance to test the solution I provided?",
      "Let me know if you need any additional assistance.",
    ],
  },
]
