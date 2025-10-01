// AI-based ticket classification and routing system
import type { Ticket, TicketPriority, TicketCategory } from "./tickets"

export interface RoutingDecision {
  shouldAutoResolve: boolean
  assignToAgent: boolean
  assignToChatbot: boolean
  suggestedAgentId?: string
  routingReason: string
  urgencyScore: number
  complexityScore: number
  automationPotential: number
}

export interface ClassificationResult {
  category: TicketCategory
  priority: TicketPriority
  sentiment: "positive" | "neutral" | "negative"
  urgency: "low" | "medium" | "high" | "critical"
  complexity: "simple" | "moderate" | "complex"
  keywords: string[]
  confidence: number
}

// Simulate NLP-based ticket classification
export const classifyTicket = async (title: string, description: string): Promise<ClassificationResult> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const text = `${title} ${description}`.toLowerCase()
  let category: TicketCategory = "other"
  let priority: TicketPriority = "medium"
  let sentiment: "positive" | "neutral" | "negative" = "neutral"
  let urgency: "low" | "medium" | "high" | "critical" = "medium"
  let complexity: "simple" | "moderate" | "complex" = "moderate"
  const keywords: string[] = []

  // Category classification using keyword matching (simulating NLP)
  if (text.match(/network|connectivity|internet|wifi|vpn|connection/i)) {
    category = "network"
    keywords.push("network", "connectivity")
  } else if (text.match(/password|login|access|authentication|account|locked/i)) {
    category = "access"
    keywords.push("access", "authentication")
    complexity = "simple"
  } else if (text.match(/virus|malware|security|breach|phishing|suspicious/i)) {
    category = "security"
    keywords.push("security", "threat")
    priority = "high"
  } else if (text.match(/hardware|device|computer|laptop|printer|monitor|keyboard/i)) {
    category = "hardware"
    keywords.push("hardware", "device")
  } else if (text.match(/software|application|install|program|app|update/i)) {
    category = "software"
    keywords.push("software", "application")
  }

  // Priority and urgency detection
  if (text.match(/critical|emergency|urgent|immediately|asap|production down|cannot work/i)) {
    priority = "critical"
    urgency = "critical"
    keywords.push("urgent")
  } else if (text.match(/important|high priority|affecting team|multiple users|business impact/i)) {
    priority = "high"
    urgency = "high"
  } else if (text.match(/minor|low priority|when possible|not urgent|convenience/i)) {
    priority = "low"
    urgency = "low"
  }

  // Sentiment analysis
  if (text.match(/frustrated|angry|unacceptable|terrible|worst|disappointed|furious/i)) {
    sentiment = "negative"
    // Escalate priority for negative sentiment
    if (priority === "low") priority = "medium"
    if (priority === "medium") priority = "high"
  } else if (text.match(/thank|appreciate|grateful|please|kindly|hope/i)) {
    sentiment = "positive"
  }

  // Complexity assessment
  if (text.match(/simple|just|only|quick|reset|restart/i)) {
    complexity = "simple"
  } else if (text.match(/complex|multiple|integration|custom|advanced|configuration/i)) {
    complexity = "complex"
  }

  // Calculate confidence based on keyword matches
  const confidence = Math.min(0.95, 0.6 + keywords.length * 0.1)

  return {
    category,
    priority,
    sentiment,
    urgency,
    complexity,
    keywords,
    confidence,
  }
}

// Determine routing decision based on classification
export const determineRouting = async (
  classification: ClassificationResult,
  ticket: Partial<Ticket>,
): Promise<RoutingDecision> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let shouldAutoResolve = false
  let assignToAgent = false
  let assignToChatbot = false
  let suggestedAgentId: string | undefined
  let routingReason = ""
  let urgencyScore = 0
  let complexityScore = 0
  let automationPotential = 0

  // Calculate scores
  switch (classification.urgency) {
    case "critical":
      urgencyScore = 100
      break
    case "high":
      urgencyScore = 75
      break
    case "medium":
      urgencyScore = 50
      break
    case "low":
      urgencyScore = 25
      break
  }

  switch (classification.complexity) {
    case "simple":
      complexityScore = 25
      automationPotential = 80
      break
    case "moderate":
      complexityScore = 50
      automationPotential = 50
      break
    case "complex":
      complexityScore = 100
      automationPotential = 20
      break
  }

  // Routing logic
  if (classification.complexity === "simple" && classification.urgency !== "critical") {
    // Simple issues can be handled by chatbot
    assignToChatbot = true
    routingReason = "Simple issue suitable for AI chatbot resolution"

    // Check if it can be auto-resolved
    if (
      classification.category === "access" &&
      ticket.title?.toLowerCase().includes("password") &&
      classification.urgency === "low"
    ) {
      shouldAutoResolve = true
      routingReason = "Common password reset - can be auto-resolved with self-service link"
    }
  } else if (classification.urgency === "critical" || classification.sentiment === "negative") {
    // Critical or negative sentiment tickets go directly to agents
    assignToAgent = true
    routingReason =
      classification.urgency === "critical"
        ? "Critical priority - requires immediate agent attention"
        : "Negative sentiment detected - escalating to human agent"

    // Suggest specialized agent based on category
    suggestedAgentId = getSuggestedAgent(classification.category)
  } else if (classification.complexity === "complex") {
    // Complex issues need agent expertise
    assignToAgent = true
    routingReason = "Complex issue requiring specialized agent expertise"
    suggestedAgentId = getSuggestedAgent(classification.category)
  } else {
    // Moderate complexity - try chatbot first with escalation option
    assignToChatbot = true
    routingReason = "Attempting AI chatbot resolution with escalation option available"
  }

  return {
    shouldAutoResolve,
    assignToAgent,
    assignToChatbot,
    suggestedAgentId,
    routingReason,
    urgencyScore,
    complexityScore,
    automationPotential,
  }
}

// Get suggested agent based on category (mock implementation)
const getSuggestedAgent = (category: TicketCategory): string => {
  // In production, this would query agent availability, expertise, and workload
  const agentMapping: Record<TicketCategory, string> = {
    network: "2", // Sarah Agent - Network specialist
    security: "2", // Sarah Agent - Security specialist
    hardware: "2", // Sarah Agent - Hardware specialist
    software: "2", // Sarah Agent - Software specialist
    access: "2", // Sarah Agent - Access management
    other: "2", // Sarah Agent - General support
  }

  return agentMapping[category]
}

// Analyze ticket trends for proactive routing
export const analyzeTicketTrends = async (
  tickets: Ticket[],
): Promise<{
  commonIssues: Array<{ issue: string; count: number; category: TicketCategory }>
  peakHours: number[]
  averageResolutionTime: number
  chatbotSuccessRate: number
}> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock trend analysis
  const commonIssues = [
    { issue: "Password reset requests", count: 45, category: "access" as TicketCategory },
    { issue: "Network connectivity issues", count: 32, category: "network" as TicketCategory },
    { issue: "Software installation requests", count: 28, category: "software" as TicketCategory },
    { issue: "Printer configuration", count: 15, category: "hardware" as TicketCategory },
  ]

  const peakHours = [9, 10, 14, 15] // 9-10 AM and 2-3 PM

  const averageResolutionTime = 4.5 // hours

  const chatbotSuccessRate = 0.68 // 68% success rate

  return {
    commonIssues,
    peakHours,
    averageResolutionTime,
    chatbotSuccessRate,
  }
}

// Real-time sentiment monitoring
export const monitorSentiment = (
  text: string,
): {
  score: number
  label: "positive" | "neutral" | "negative"
  indicators: string[]
} => {
  const lowerText = text.toLowerCase()
  let score = 0
  const indicators: string[] = []

  // Positive indicators
  const positiveWords = ["thank", "appreciate", "great", "excellent", "helpful", "satisfied", "pleased"]
  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) {
      score += 1
      indicators.push(`+${word}`)
    }
  })

  // Negative indicators
  const negativeWords = [
    "frustrated",
    "angry",
    "terrible",
    "worst",
    "unacceptable",
    "disappointed",
    "useless",
    "broken",
  ]
  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) {
      score -= 2
      indicators.push(`-${word}`)
    }
  })

  let label: "positive" | "neutral" | "negative" = "neutral"
  if (score >= 2) label = "positive"
  else if (score <= -2) label = "negative"

  return { score, label, indicators }
}
