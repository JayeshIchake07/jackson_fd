// AI Chatbot service with NLU and automated resolution
export interface ChatbotMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  actions?: ChatbotAction[]
}

export interface ChatbotAction {
  type: "create_ticket" | "search_kb" | "escalate" | "resolve"
  label: string
  data?: any
}

export interface ChatbotSession {
  id: string
  userId: string
  messages: ChatbotMessage[]
  context: {
    intent?: string
    entities?: Record<string, string>
    ticketId?: string
    resolved?: boolean
  }
  createdAt: Date
  updatedAt: Date
}

// Mock chatbot sessions
const chatbotSessions: Map<string, ChatbotSession> = new Map()

export const getChatbotSession = (userId: string): ChatbotSession => {
  if (!chatbotSessions.has(userId)) {
    chatbotSessions.set(userId, {
      id: `session-${Date.now()}`,
      userId,
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm your AI support assistant. I can help you with common IT issues, create tickets, or find solutions in our knowledge base. What can I help you with today?",
          timestamp: new Date(),
          suggestions: [
            "I need to reset my password",
            "My computer won't turn on",
            "I can't connect to the network",
            "I need software installed",
          ],
        },
      ],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
  return chatbotSessions.get(userId)!
}

export const sendChatbotMessage = async (userId: string, message: string): Promise<ChatbotMessage> => {
  const session = getChatbotSession(userId)

  // Add user message
  const userMessage: ChatbotMessage = {
    id: `msg-${Date.now()}`,
    role: "user",
    content: message,
    timestamp: new Date(),
  }
  session.messages.push(userMessage)

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Analyze intent and generate response
  const response = await generateChatbotResponse(message, session.context)

  // Add assistant message
  const assistantMessage: ChatbotMessage = {
    id: `msg-${Date.now() + 1}`,
    role: "assistant",
    content: response.content,
    timestamp: new Date(),
    suggestions: response.suggestions,
    actions: response.actions,
  }
  session.messages.push(assistantMessage)

  // Update context
  session.context = { ...session.context, ...response.context }
  session.updatedAt = new Date()

  return assistantMessage
}

interface ChatbotResponse {
  content: string
  suggestions?: string[]
  actions?: ChatbotAction[]
  context?: Record<string, any>
}

const generateChatbotResponse = async (message: string, context: Record<string, any>): Promise<ChatbotResponse> => {
  const lowerMessage = message.toLowerCase()

  // Password reset intent
  if (lowerMessage.match(/password|reset|login|access|locked|forgot/i)) {
    return {
      content:
        "I can help you reset your password! You have two options:\n\n1. Use our self-service password reset portal (fastest)\n2. I can create a ticket for our IT team\n\nWhich would you prefer?",
      suggestions: ["Use self-service portal", "Create a ticket", "I need more help"],
      actions: [
        {
          type: "resolve",
          label: "Self-Service Portal",
          data: { url: "https://reset.example.com" },
        },
        {
          type: "create_ticket",
          label: "Create Ticket",
          data: { category: "access", priority: "medium" },
        },
      ],
      context: { intent: "password_reset" },
    }
  }

  // Network connectivity intent
  if (lowerMessage.match(/network|wifi|internet|connection|connect/i)) {
    return {
      content:
        "I understand you're having network connectivity issues. Let me help you troubleshoot:\n\n1. Have you tried restarting your computer?\n2. Are other devices able to connect to the network?\n3. Are you seeing any error messages?\n\nPlease let me know, or I can create a ticket for our network team.",
      suggestions: ["Yes, I tried restarting", "No, nothing works", "Create a ticket"],
      actions: [
        {
          type: "search_kb",
          label: "View Network Troubleshooting Guide",
          data: { query: "network connectivity" },
        },
        {
          type: "create_ticket",
          label: "Create Network Ticket",
          data: { category: "network", priority: "high" },
        },
      ],
      context: { intent: "network_issue" },
    }
  }

  // Hardware issues
  if (lowerMessage.match(/computer|laptop|device|hardware|won't turn on|broken/i)) {
    return {
      content:
        "I see you're experiencing hardware issues. To better assist you:\n\n1. What type of device is it? (laptop, desktop, printer, etc.)\n2. What exactly is happening?\n3. When did this start?\n\nI can also create a hardware support ticket for you right away.",
      suggestions: ["It's a laptop", "It's a desktop", "Create a ticket"],
      actions: [
        {
          type: "create_ticket",
          label: "Create Hardware Ticket",
          data: { category: "hardware", priority: "high" },
        },
      ],
      context: { intent: "hardware_issue" },
    }
  }

  // Software installation
  if (lowerMessage.match(/software|install|application|program|app/i)) {
    return {
      content:
        "I can help you with software installation! Please provide:\n\n1. What software do you need?\n2. Is this for work purposes?\n3. Do you have approval from your manager?\n\nOnce I have this information, I'll create a software installation request for you.",
      suggestions: ["Microsoft Office", "Adobe Creative Suite", "Other software"],
      actions: [
        {
          type: "create_ticket",
          label: "Create Software Request",
          data: { category: "software", priority: "medium" },
        },
      ],
      context: { intent: "software_installation" },
    }
  }

  // Escalation request
  if (lowerMessage.match(/speak|talk|human|agent|person|escalate/i)) {
    return {
      content:
        "I understand you'd like to speak with a human agent. I'll create a ticket and assign it to our support team right away. They'll reach out to you shortly.\n\nWould you like to provide any additional details about your issue?",
      suggestions: ["Yes, add details", "No, that's all"],
      actions: [
        {
          type: "escalate",
          label: "Escalate to Agent",
          data: { priority: "high" },
        },
      ],
      context: { intent: "escalation" },
    }
  }

  // General help
  if (lowerMessage.match(/help|what can you do|options|menu/i)) {
    return {
      content:
        "I can assist you with:\n\n• Password resets and account access\n• Network connectivity issues\n• Hardware problems\n• Software installation requests\n• General IT questions\n\nI can also search our knowledge base or create tickets for you. What would you like help with?",
      suggestions: [
        "Password reset",
        "Network issues",
        "Hardware problems",
        "Software installation",
        "Browse knowledge base",
      ],
    }
  }

  // Default response
  return {
    content:
      "I'm here to help! Could you please provide more details about your issue? For example:\n\n• What problem are you experiencing?\n• When did it start?\n• Have you tried any troubleshooting steps?\n\nOr you can choose from these common issues:",
    suggestions: [
      "Password reset",
      "Network connectivity",
      "Hardware issue",
      "Software installation",
      "Speak to an agent",
    ],
  }
}

export const clearChatbotSession = (userId: string) => {
  chatbotSessions.delete(userId)
}

// Chatbot analytics
export interface ChatbotAnalytics {
  totalSessions: number
  resolvedByBot: number
  escalatedToAgent: number
  averageResolutionTime: number
  topIntents: Array<{ intent: string; count: number }>
  satisfactionScore: number
}

export const getChatbotAnalytics = (): ChatbotAnalytics => {
  return {
    totalSessions: 156,
    resolvedByBot: 106,
    escalatedToAgent: 50,
    averageResolutionTime: 3.5, // minutes
    topIntents: [
      { intent: "password_reset", count: 45 },
      { intent: "network_issue", count: 32 },
      { intent: "software_installation", count: 28 },
      { intent: "hardware_issue", count: 21 },
      { intent: "escalation", count: 30 },
    ],
    satisfactionScore: 4.2, // out of 5
  }
}
