// AI service for ticket analysis and classification
export interface AIAnalysisResult {
  suggestedCategory: string
  suggestedPriority: string
  extractedIssues: string[]
  sentiment: "positive" | "neutral" | "negative"
  confidence: number
  relatedArticles: string[]
}

export interface ErrorExtractionResult {
  errorType: string
  errorMessage: string
  stackTrace?: string
  affectedComponent?: string
}

// AI-powered error extraction from screenshots/videos
export const extractErrorFromMedia = async (file: File): Promise<ErrorExtractionResult | null> => {
  try {
    // Simulate API call delay for processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo purposes, only extract errors from actual error screenshots
    // In a real implementation, this would use computer vision APIs
    const fileName = file.name.toLowerCase()
    
    // Only show mock errors for files that appear to be actual error screenshots
    if (fileName.includes('error') || fileName.includes('crash') || fileName.includes('bug')) {
      if (file.type.startsWith("image/")) {
        return {
          errorType: "Application Error",
          errorMessage: "Error detected in uploaded image",
          affectedComponent: "Application Module",
        }
      } else if (file.type.startsWith("video/")) {
        return {
          errorType: "UI Rendering Issue", 
          errorMessage: "Visual issue detected in uploaded video",
          affectedComponent: "Display Module",
        }
      }
    }

    // For regular images/videos, return null (no error detected)
    return null
  } catch (error) {
    console.error('Error processing media file:', error)
    return null
  }
}

// Simulate AI-powered ticket analysis
export const analyzeTicketContent = async (
  title: string,
  description: string,
  attachments: File[],
): Promise<AIAnalysisResult> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock AI analysis based on content
  const lowerTitle = title.toLowerCase()
  const lowerDesc = description.toLowerCase()

  let suggestedCategory = "other"
  let suggestedPriority = "medium"
  let sentiment: "positive" | "neutral" | "negative" = "neutral"
  const extractedIssues: string[] = []
  const relatedArticles: string[] = []

  // Category detection
  if (lowerTitle.includes("network") || lowerDesc.includes("network") || lowerDesc.includes("connectivity")) {
    suggestedCategory = "network"
    relatedArticles.push("KB-001: Network Troubleshooting Guide", "KB-015: VPN Connection Issues")
  } else if (lowerTitle.includes("password") || lowerDesc.includes("password") || lowerDesc.includes("login")) {
    suggestedCategory = "access"
    relatedArticles.push("KB-003: Password Reset Procedure", "KB-012: Account Access Issues")
  } else if (lowerTitle.includes("software") || lowerDesc.includes("install") || lowerDesc.includes("application")) {
    suggestedCategory = "software"
    relatedArticles.push("KB-005: Software Installation Guide", "KB-018: Common Software Issues")
  } else if (lowerTitle.includes("hardware") || lowerDesc.includes("device") || lowerDesc.includes("equipment")) {
    suggestedCategory = "hardware"
    relatedArticles.push("KB-007: Hardware Troubleshooting", "KB-020: Device Setup Guide")
  } else if (lowerTitle.includes("security") || lowerDesc.includes("virus") || lowerDesc.includes("malware")) {
    suggestedCategory = "security"
    relatedArticles.push("KB-009: Security Best Practices", "KB-022: Malware Removal Guide")
  }

  // Priority detection
  if (
    lowerTitle.includes("critical") ||
    lowerTitle.includes("urgent") ||
    lowerDesc.includes("production down") ||
    lowerDesc.includes("cannot work")
  ) {
    suggestedPriority = "critical"
  } else if (
    lowerTitle.includes("important") ||
    lowerDesc.includes("affecting multiple") ||
    lowerDesc.includes("team")
  ) {
    suggestedPriority = "high"
  } else if (lowerDesc.includes("minor") || lowerDesc.includes("when possible")) {
    suggestedPriority = "low"
  }

  // Sentiment analysis
  if (lowerDesc.includes("frustrated") || lowerDesc.includes("angry") || lowerDesc.includes("unacceptable")) {
    sentiment = "negative"
  } else if (lowerDesc.includes("thank") || lowerDesc.includes("appreciate") || lowerDesc.includes("please")) {
    sentiment = "positive"
  }

  // Extract specific issues
  if (lowerDesc.includes("error")) {
    extractedIssues.push("Error message detected in description")
  }
  if (lowerDesc.includes("slow") || lowerDesc.includes("performance")) {
    extractedIssues.push("Performance issue identified")
  }
  if (attachments.length > 0) {
    extractedIssues.push(`${attachments.length} attachment(s) provided for analysis`)
  }

  return {
    suggestedCategory,
    suggestedPriority,
    extractedIssues,
    sentiment,
    confidence: 0.85,
    relatedArticles,
  }
}

// Real-time AI suggestions based on title input
export interface AISuggestion {
  category: string
  priority: string
  confidence: number
  reasoning: string
  relatedArticles: string[]
}

export const getRealtimeSuggestions = async (title: string, description: string = ""): Promise<AISuggestion | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const lowerTitle = title.toLowerCase()
  const lowerDesc = description.toLowerCase()
  const combinedText = `${lowerTitle} ${lowerDesc}`

  // Enhanced category detection with more keywords
  const categoryPatterns = {
    network: [
      "network", "wifi", "internet", "connection", "connectivity", "vpn", "lan", "wan", 
      "ethernet", "wireless", "router", "modem", "bandwidth", "speed", "timeout", "disconnect",
      "switch", "configuration", "monitoring"
    ],
    access: [
      "password", "login", "access", "account", "authentication", "credentials", "locked out",
      "can't log in", "forgot password", "reset", "mfa", "2fa", "single sign on", "sso",
      "permissions", "shared drive", "provisioning"
    ],
    software: [
      "software", "application", "app", "install", "installation", "update", "upgrade",
      "crash", "freeze", "not responding", "error", "bug", "feature", "license", "activation",
      "deployment", "automation", "management"
    ],
    hardware: [
      "hardware", "device", "computer", "laptop", "desktop", "printer", "scanner", "monitor",
      "keyboard", "mouse", "camera", "microphone", "speaker", "broken", "not working", "malfunction"
    ],
    security: [
      "security", "virus", "malware", "phishing", "spam", "firewall", "antivirus", "threat",
      "suspicious", "breach", "unauthorized", "hack", "intrusion", "vulnerability", "patch",
      "audit", "compliance", "rule"
    ],
    email: [
      "email", "outlook", "mail", "exchange", "gmail", "smtp", "pop", "imap", "signature",
      "attachment", "spam", "inbox", "sent", "calendar", "contacts", "sync"
    ],
    printer: [
      "printer", "print", "printing", "paper jam", "ink", "toner", "driver", "queue",
      "scanner", "copy", "fax", "wireless printer", "network printer"
    ],
    performance: [
      "slow", "performance", "lag", "freeze", "hang", "memory", "cpu", "disk", "storage",
      "space", "ram", "speed", "optimization", "cleanup", "defrag", "monitoring", "metrics"
    ],
    database: [
      "database", "db", "sql", "backup", "restore", "query", "table", "index", "integrity",
      "verification", "corruption", "replication"
    ],
    system: [
      "system", "server", "service", "daemon", "process", "kernel", "os", "operating system",
      "upgrade", "patch", "maintenance", "reboot", "restart"
    ],
    infrastructure: [
      "infrastructure", "server", "datacenter", "rack", "power", "cooling", "backup",
      "storage", "san", "nas", "expansion", "capacity"
    ],
    "disaster-recovery": [
      "disaster", "recovery", "backup", "restore", "failover", "redundancy", "plan",
      "procedure", "contact", "emergency", "continuity"
    ],
    cloud: [
      "cloud", "aws", "azure", "gcp", "migration", "saas", "paas", "iaas", "virtual",
      "container", "kubernetes", "docker", "strategy", "planning"
    ]
  }

  // Priority detection patterns
  const priorityPatterns = {
    critical: [
      "critical", "urgent", "emergency", "down", "outage", "production down", "cannot work",
      "system down", "server down", "database down", "complete failure", "total loss"
    ],
    high: [
      "important", "asap", "soon", "affecting", "multiple users", "team", "department",
      "business impact", "revenue", "customer", "client", "deadline", "blocking"
    ],
    low: [
      "minor", "small", "cosmetic", "nice to have", "when possible", "low priority",
      "non-critical", "optional", "enhancement", "improvement", "suggestion"
    ]
  }

  // Find best matching category
  let bestCategory = "other"
  let bestConfidence = 0
  let reasoning = ""

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    const matches = patterns.filter(pattern => combinedText.includes(pattern))
    const confidence = matches.length / patterns.length
    
    if (confidence > bestConfidence && matches.length > 0) {
      bestCategory = category
      bestConfidence = confidence
      reasoning = `Detected keywords: ${matches.join(", ")}`
    }
  }

  // Find priority
  let suggestedPriority = "medium"
  let priorityReasoning = "Standard business impact"

  for (const [priority, patterns] of Object.entries(priorityPatterns)) {
    if (patterns.some(pattern => combinedText.includes(pattern))) {
      suggestedPriority = priority
      priorityReasoning = `Detected priority indicators: ${patterns.filter(p => combinedText.includes(p)).join(", ")}`
      break
    }
  }

  // Get related articles based on category
  const getRelatedArticles = (category: string): string[] => {
    const articles = {
      network: [
        "KB-001: Network Troubleshooting Guide",
        "KB-015: VPN Connection Issues",
        "KB-024: WiFi Setup Instructions",
        "KB-028: Network Performance Optimization"
      ],
      access: [
        "KB-003: Password Reset Procedure",
        "KB-012: Account Access Issues",
        "KB-019: Multi-Factor Authentication Setup",
        "KB-025: Single Sign-On Configuration"
      ],
      software: [
        "KB-005: Software Installation Guide",
        "KB-018: Common Software Issues",
        "KB-026: Application Troubleshooting",
        "KB-030: Software License Management"
      ],
      hardware: [
        "KB-007: Hardware Troubleshooting",
        "KB-020: Device Setup Guide",
        "KB-027: Hardware Maintenance",
        "KB-031: Equipment Replacement Process"
      ],
      security: [
        "KB-009: Security Best Practices",
        "KB-022: Malware Removal Guide",
        "KB-029: Security Incident Response",
        "KB-032: Vulnerability Management"
      ],
      email: [
        "KB-006: Email Configuration Guide",
        "KB-014: Outlook Troubleshooting",
        "KB-021: Email Forwarding Setup",
        "KB-033: Email Security Best Practices"
      ],
      printer: [
        "KB-008: Printer Setup Guide",
        "KB-016: Print Queue Issues",
        "KB-023: Network Printer Configuration",
        "KB-034: Printer Maintenance"
      ],
      performance: [
        "KB-011: System Performance Optimization",
        "KB-017: Memory Management",
        "KB-024: Disk Cleanup Procedures",
        "KB-035: Performance Monitoring"
      ],
      database: [
        "KB-036: Database Backup Procedures",
        "KB-037: SQL Query Optimization",
        "KB-038: Database Maintenance Guide",
        "KB-039: Data Recovery Procedures"
      ],
      system: [
        "KB-040: System Administration Guide",
        "KB-041: Server Maintenance Procedures",
        "KB-042: Service Management",
        "KB-043: System Monitoring Setup"
      ],
      infrastructure: [
        "KB-044: Infrastructure Planning Guide",
        "KB-045: Data Center Management",
        "KB-046: Capacity Planning",
        "KB-047: Infrastructure Monitoring"
      ],
      "disaster-recovery": [
        "KB-048: Disaster Recovery Planning",
        "KB-049: Backup and Restore Procedures",
        "KB-050: Business Continuity Planning",
        "KB-051: Emergency Response Procedures"
      ],
      cloud: [
        "KB-052: Cloud Migration Guide",
        "KB-053: Cloud Security Best Practices",
        "KB-054: Container Management",
        "KB-055: Cloud Cost Optimization"
      ]
    }
    return articles[category as keyof typeof articles] || ["KB-002: General IT Support FAQ", "KB-010: Common Issues and Solutions"]
  }

  // Only return suggestion if confidence is above threshold
  if (bestConfidence > 0.1 || title.length > 10) {
    return {
      category: bestCategory,
      priority: suggestedPriority,
      confidence: Math.min(bestConfidence + 0.3, 0.95), // Boost confidence for longer titles
      reasoning: reasoning || `Based on title analysis: "${title}"`,
      relatedArticles: getRelatedArticles(bestCategory)
    }
  }

  return null
}

// Simulate real-time KB article suggestions
export const getKBSuggestions = async (query: string): Promise<string[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const lowerQuery = query.toLowerCase()
  const suggestions: string[] = []

  if (lowerQuery.includes("network") || lowerQuery.includes("internet") || lowerQuery.includes("wifi")) {
    suggestions.push(
      "KB-001: Network Troubleshooting Guide",
      "KB-015: VPN Connection Issues",
      "KB-024: WiFi Setup Instructions",
    )
  }

  if (lowerQuery.includes("password") || lowerQuery.includes("login") || lowerQuery.includes("access")) {
    suggestions.push(
      "KB-003: Password Reset Procedure",
      "KB-012: Account Access Issues",
      "KB-019: Multi-Factor Authentication Setup",
    )
  }

  if (lowerQuery.includes("email") || lowerQuery.includes("outlook") || lowerQuery.includes("mail")) {
    suggestions.push("KB-006: Email Configuration Guide", "KB-014: Outlook Troubleshooting", "KB-021: Email Forwarding")
  }

  if (lowerQuery.includes("printer") || lowerQuery.includes("print")) {
    suggestions.push(
      "KB-008: Printer Setup Guide",
      "KB-016: Print Queue Issues",
      "KB-023: Network Printer Configuration",
    )
  }

  if (suggestions.length === 0) {
    suggestions.push("KB-002: General IT Support FAQ", "KB-010: Common Issues and Solutions")
  }

  return suggestions.slice(0, 5)
}
