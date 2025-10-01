export type TicketStatus = "open" | "in-progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "critical"
export type TicketCategory = "network" | "security" | "hardware" | "software" | "access" | "other"
export type TicketSource = "portal" | "email" | "chatbot" | "phone" | "api"

export interface TicketFeedback {
  rating: number
  comment?: string
  submittedAt: Date
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  source: TicketSource
  submittedBy: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  comments: TicketComment[]
  tags?: string[]
  feedback?: TicketFeedback
}

export interface TicketComment {
  id: string
  ticketId: string
  userId: string
  userName: string
  userRole: string
  content: string
  createdAt: Date
}

// Mock ticket data
export const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    title: "Network connectivity issues in Building A",
    description:
      "Users in Building A are experiencing intermittent network connectivity issues. The problem started this morning around 9 AM and affects approximately 50 users.",
    category: "network",
    priority: "high",
    status: "in-progress",
    source: "email",
    submittedBy: "1",
    assignedTo: "2",
    createdAt: new Date("2024-01-15T09:00:00"),
    updatedAt: new Date("2024-01-15T10:30:00"),
    comments: [
      {
        id: "1",
        ticketId: "TKT-001",
        userId: "2",
        userName: "Sarah Agent",
        userRole: "agent",
        content: "I've identified the issue with the network switch. Working on a solution now.",
        createdAt: new Date("2024-01-15T10:30:00"),
      },
    ],
    tags: ["network", "urgent"],
  },
  {
    id: "TKT-002",
    title: "Software installation request - Adobe Creative Suite",
    description: "Need Adobe Creative Suite installed on my workstation for upcoming design projects.",
    category: "software",
    priority: "medium",
    status: "open",
    source: "portal",
    submittedBy: "1",
    createdAt: new Date("2024-01-14T14:20:00"),
    updatedAt: new Date("2024-01-14T14:20:00"),
    comments: [],
    tags: ["software", "installation"],
  },
  {
    id: "TKT-003",
    title: "Password reset for domain account",
    description: "Unable to access my domain account. Need password reset assistance.",
    category: "access",
    priority: "medium",
    status: "resolved",
    source: "chatbot",
    submittedBy: "1",
    assignedTo: "2",
    createdAt: new Date("2024-01-13T11:15:00"),
    updatedAt: new Date("2024-01-13T11:45:00"),
    resolvedAt: new Date("2024-01-13T11:45:00"),
    comments: [
      {
        id: "2",
        ticketId: "TKT-003",
        userId: "2",
        userName: "Sarah Agent",
        userRole: "agent",
        content: "Password has been reset. Please check your email for the temporary password.",
        createdAt: new Date("2024-01-13T11:45:00"),
      },
    ],
    tags: ["access", "password"],
    feedback: {
      rating: 5,
      comment: "Quick and professional service!",
      submittedAt: new Date("2024-01-13T12:00:00"),
    },
  },
  {
    id: "TKT-004",
    title: "Hardware failure - Desktop computer won't boot",
    description: "My desktop computer won't start up. It shows a blue screen error and then shuts down.",
    category: "hardware",
    priority: "high",
    status: "open",
    source: "portal",
    submittedBy: "1",
    createdAt: new Date("2024-01-12T16:30:00"),
    updatedAt: new Date("2024-01-12T16:30:00"),
    comments: [],
    tags: ["hardware", "desktop"],
  },
  {
    id: "TKT-005",
    title: "Email not syncing on mobile device",
    description: "My work email is not syncing properly on my iPhone. I'm missing important messages.",
    category: "email",
    priority: "medium",
    status: "in-progress",
    source: "email",
    submittedBy: "1",
    assignedTo: "2",
    createdAt: new Date("2024-01-11T13:45:00"),
    updatedAt: new Date("2024-01-11T14:15:00"),
    comments: [],
    tags: ["email", "mobile"],
  },
  {
    id: "TKT-006",
    title: "Security alert - Suspicious login attempt",
    description: "Received a security alert about a suspicious login attempt from an unknown location.",
    category: "security",
    priority: "critical",
    status: "resolved",
    source: "system",
    submittedBy: "1",
    assignedTo: "2",
    createdAt: new Date("2024-01-10T08:20:00"),
    updatedAt: new Date("2024-01-10T09:00:00"),
    resolvedAt: new Date("2024-01-10T09:00:00"),
    comments: [],
    tags: ["security", "login"],
  },
  {
    id: "TKT-007",
    title: "Printer not working in office",
    description: "The office printer is showing an error and won't print any documents.",
    category: "printer",
    priority: "medium",
    status: "open",
    source: "portal",
    submittedBy: "1",
    createdAt: new Date("2024-01-09T10:15:00"),
    updatedAt: new Date("2024-01-09T10:15:00"),
    comments: [],
    tags: ["printer", "office"],
  },
  // Employee-specific tickets
  {
    id: "TKT-008",
    title: "VPN connection keeps dropping",
    description: "My VPN connection keeps disconnecting every few minutes while working from home.",
    category: "network",
    priority: "high",
    status: "open",
    source: "portal",
    submittedBy: "1", // Employee
    createdAt: new Date("2024-01-08T09:30:00"),
    updatedAt: new Date("2024-01-08T09:30:00"),
    comments: [],
    tags: ["vpn", "remote-work"],
  },
  {
    id: "TKT-009",
    title: "Need Microsoft Office license renewal",
    description: "My Microsoft Office license is expiring next week. Need assistance with renewal.",
    category: "software",
    priority: "medium",
    status: "in-progress",
    source: "email",
    submittedBy: "1", // Employee
    assignedTo: "2",
    createdAt: new Date("2024-01-07T14:20:00"),
    updatedAt: new Date("2024-01-07T15:00:00"),
    comments: [],
    tags: ["office", "license"],
  },
  {
    id: "TKT-010",
    title: "Laptop keyboard not working properly",
    description: "Several keys on my laptop keyboard are not responding correctly.",
    category: "hardware",
    priority: "medium",
    status: "open",
    source: "portal",
    submittedBy: "1", // Employee
    createdAt: new Date("2024-01-06T11:15:00"),
    updatedAt: new Date("2024-01-06T11:15:00"),
    comments: [],
    tags: ["laptop", "keyboard"],
  },
  {
    id: "TKT-011",
    title: "Can't access shared drive",
    description: "I'm unable to access the shared drive for my department. Getting permission denied error.",
    category: "access",
    priority: "high",
    status: "resolved",
    source: "chatbot",
    submittedBy: "1", // Employee
    assignedTo: "2",
    createdAt: new Date("2024-01-05T10:45:00"),
    updatedAt: new Date("2024-01-05T11:30:00"),
    resolvedAt: new Date("2024-01-05T11:30:00"),
    comments: [],
    tags: ["shared-drive", "permissions"],
    feedback: {
      rating: 4,
      comment: "Quick resolution, thank you!",
      submittedAt: new Date("2024-01-05T12:00:00"),
    },
  },
  {
    id: "TKT-012",
    title: "Outlook calendar not syncing",
    description: "My Outlook calendar is not syncing with my mobile device calendar.",
    category: "email",
    priority: "low",
    status: "open",
    source: "portal",
    submittedBy: "1", // Employee
    createdAt: new Date("2024-01-04T16:30:00"),
    updatedAt: new Date("2024-01-04T16:30:00"),
    comments: [],
    tags: ["outlook", "calendar"],
  },
  // Agent-specific tickets
  {
    id: "TKT-013",
    title: "System performance monitoring alert",
    description: "Server performance metrics showing unusual spikes. Need investigation.",
    category: "performance",
    priority: "critical",
    status: "in-progress",
    source: "system",
    submittedBy: "2", // Agent
    assignedTo: "2",
    createdAt: new Date("2024-01-03T08:00:00"),
    updatedAt: new Date("2024-01-03T09:15:00"),
    comments: [],
    tags: ["server", "performance"],
  },
  {
    id: "TKT-014",
    title: "Database backup verification needed",
    description: "Need to verify the integrity of last night's database backup.",
    category: "database",
    priority: "high",
    status: "open",
    source: "portal",
    submittedBy: "2", // Agent
    createdAt: new Date("2024-01-02T13:20:00"),
    updatedAt: new Date("2024-01-02T13:20:00"),
    comments: [],
    tags: ["database", "backup"],
  },
  {
    id: "TKT-015",
    title: "Firewall rule update request",
    description: "Need to update firewall rules to allow new application traffic.",
    category: "security",
    priority: "medium",
    status: "resolved",
    source: "email",
    submittedBy: "2", // Agent
    assignedTo: "2",
    createdAt: new Date("2024-01-01T15:45:00"),
    updatedAt: new Date("2024-01-01T16:30:00"),
    resolvedAt: new Date("2024-01-01T16:30:00"),
    comments: [],
    tags: ["firewall", "security"],
  },
  {
    id: "TKT-016",
    title: "Network switch configuration issue",
    description: "Port configuration on Building B network switch needs adjustment.",
    category: "network",
    priority: "medium",
    status: "open",
    source: "portal",
    submittedBy: "2", // Agent
    createdAt: new Date("2023-12-31T10:15:00"),
    updatedAt: new Date("2023-12-31T10:15:00"),
    comments: [],
    tags: ["switch", "configuration"],
  },
  {
    id: "TKT-017",
    title: "Software deployment automation",
    description: "Need to automate software deployment process for new workstations.",
    category: "software",
    priority: "low",
    status: "in-progress",
    source: "portal",
    submittedBy: "2", // Agent
    assignedTo: "2",
    createdAt: new Date("2023-12-30T14:30:00"),
    updatedAt: new Date("2023-12-30T15:00:00"),
    comments: [],
    tags: ["automation", "deployment"],
  },
  // Admin-specific tickets
  {
    id: "TKT-018",
    title: "User account provisioning system upgrade",
    description: "Need to upgrade the user account provisioning system to latest version.",
    category: "system",
    priority: "high",
    status: "open",
    source: "portal",
    submittedBy: "3", // Admin
    createdAt: new Date("2023-12-29T09:00:00"),
    updatedAt: new Date("2023-12-29T09:00:00"),
    comments: [],
    tags: ["provisioning", "upgrade"],
  },
  {
    id: "TKT-019",
    title: "Security audit compliance review",
    description: "Annual security audit compliance review needs to be completed.",
    category: "security",
    priority: "critical",
    status: "in-progress",
    source: "email",
    submittedBy: "3", // Admin
    assignedTo: "3",
    createdAt: new Date("2023-12-28T11:30:00"),
    updatedAt: new Date("2023-12-28T12:15:00"),
    comments: [],
    tags: ["audit", "compliance"],
  },
  {
    id: "TKT-020",
    title: "Backup infrastructure expansion",
    description: "Need to expand backup infrastructure to handle increased data volume.",
    category: "infrastructure",
    priority: "medium",
    status: "open",
    source: "portal",
    submittedBy: "3", // Admin
    createdAt: new Date("2023-12-27T16:45:00"),
    updatedAt: new Date("2023-12-27T16:45:00"),
    comments: [],
    tags: ["backup", "infrastructure"],
  },
  {
    id: "TKT-021",
    title: "License management system implementation",
    description: "Implement new software license management system across organization.",
    category: "software",
    priority: "high",
    status: "resolved",
    source: "portal",
    submittedBy: "3", // Admin
    assignedTo: "3",
    createdAt: new Date("2023-12-26T13:20:00"),
    updatedAt: new Date("2023-12-26T14:30:00"),
    resolvedAt: new Date("2023-12-26T14:30:00"),
    comments: [],
    tags: ["license", "management"],
    feedback: {
      rating: 5,
      comment: "Excellent implementation!",
      submittedAt: new Date("2023-12-26T15:00:00"),
    },
  },
  {
    id: "TKT-022",
    title: "Network monitoring tool configuration",
    description: "Configure new network monitoring tool for better visibility.",
    category: "network",
    priority: "medium",
    status: "open",
    source: "email",
    submittedBy: "3", // Admin
    createdAt: new Date("2023-12-25T10:00:00"),
    updatedAt: new Date("2023-12-25T10:00:00"),
    comments: [],
    tags: ["monitoring", "network"],
  },
  {
    id: "TKT-023",
    title: "Disaster recovery plan update",
    description: "Update disaster recovery plan with new procedures and contacts.",
    category: "disaster-recovery",
    priority: "high",
    status: "in-progress",
    source: "portal",
    submittedBy: "3", // Admin
    assignedTo: "3",
    createdAt: new Date("2023-12-24T14:15:00"),
    updatedAt: new Date("2023-12-24T15:00:00"),
    comments: [],
    tags: ["disaster-recovery", "planning"],
  },
  {
    id: "TKT-024",
    title: "Cloud migration strategy planning",
    description: "Plan migration strategy for moving on-premise systems to cloud.",
    category: "cloud",
    priority: "medium",
    status: "open",
    source: "portal",
    submittedBy: "3", // Admin
    createdAt: new Date("2023-12-23T11:30:00"),
    updatedAt: new Date("2023-12-23T11:30:00"),
    comments: [],
    tags: ["cloud", "migration"],
  },
]

export const getTicketsByUser = (userId: string): Ticket[] => {
  return mockTickets.filter((ticket) => ticket.submittedBy === userId)
}

export const createTicket = (ticketData: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "comments">): Ticket => {
  const newTicket: Ticket = {
    ...ticketData,
    id: `TKT-${String(mockTickets.length + 1).padStart(3, "0")}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
  }
  mockTickets.push(newTicket)
  return newTicket
}

export const getAllTickets = (): Ticket[] => {
  return mockTickets
}

export const getTickets = (): Ticket[] => {
  return mockTickets
}

export const getTicketsByAgent = (agentId: string): Ticket[] => {
  return mockTickets.filter((ticket) => ticket.assignedTo === agentId)
}

export const getUnassignedTickets = (): Ticket[] => {
  return mockTickets.filter((ticket) => !ticket.assignedTo)
}

export const updateTicketStatus = (ticketId: string, status: TicketStatus): boolean => {
  const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === ticketId)
  if (ticketIndex !== -1) {
    mockTickets[ticketIndex].status = status
    mockTickets[ticketIndex].updatedAt = new Date()
    if (status === "resolved" || status === "closed") {
      mockTickets[ticketIndex].resolvedAt = new Date()
    }
    return true
  }
  return false
}

export const assignTicket = (ticketId: string, agentId: string): boolean => {
  const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === ticketId)
  if (ticketIndex !== -1) {
    mockTickets[ticketIndex].assignedTo = agentId
    mockTickets[ticketIndex].updatedAt = new Date()
    return true
  }
  return false
}

export const addTicketComment = (
  ticketId: string,
  userId: string,
  userName: string,
  userRole: string,
  content: string,
): boolean => {
  const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === ticketId)
  if (ticketIndex !== -1) {
    const newComment: TicketComment = {
      id: `comment-${Date.now()}`,
      ticketId,
      userId,
      userName,
      userRole,
      content,
      createdAt: new Date(),
    }
    mockTickets[ticketIndex].comments.push(newComment)
    mockTickets[ticketIndex].updatedAt = new Date()
    return true
  }
  return false
}

export const submitTicketFeedback = (ticketId: string, rating: number, comment?: string): boolean => {
  const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === ticketId)
  if (ticketIndex !== -1) {
    mockTickets[ticketIndex].feedback = {
      rating,
      comment,
      submittedAt: new Date(),
    }
    mockTickets[ticketIndex].updatedAt = new Date()
    return true
  }
  return false
}

export const getTicketById = (ticketId: string): Ticket | undefined => {
  return mockTickets.find((ticket) => ticket.id === ticketId)
}

export const getTicketStatusColor = (status: TicketStatus) => {
  switch (status) {
    case "open":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "in-progress":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "resolved":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "closed":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

export const getPriorityColor = (priority: TicketPriority) => {
  switch (priority) {
    case "low":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "medium":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "high":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "critical":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}

// Bulk action functions
export const bulkUpdateStatus = (ticketIds: string[], status: TicketStatus): boolean => {
  let updated = 0
  ticketIds.forEach((ticketId) => {
    const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === ticketId)
    if (ticketIndex !== -1) {
      mockTickets[ticketIndex].status = status
      mockTickets[ticketIndex].updatedAt = new Date()
      if (status === "resolved" || status === "closed") {
        mockTickets[ticketIndex].resolvedAt = new Date()
      }
      updated++
    }
  })
  return updated > 0
}

export const bulkAssignTickets = (ticketIds: string[], agentId: string): boolean => {
  let updated = 0
  ticketIds.forEach((ticketId) => {
    const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === ticketId)
    if (ticketIndex !== -1) {
      mockTickets[ticketIndex].assignedTo = agentId
      mockTickets[ticketIndex].updatedAt = new Date()
      updated++
    }
  })
  return updated > 0
}

export const bulkDeleteTickets = (ticketIds: string[]): boolean => {
  ticketIds.forEach((ticketId) => {
    const ticketIndex = mockTickets.findIndex((ticket) => ticket.id === ticketId)
    if (ticketIndex !== -1) {
      mockTickets.splice(ticketIndex, 1)
    }
  })
  return true
}

// Advanced filtering and sorting utilities
export const getSourceColor = (source: TicketSource) => {
  switch (source) {
    case "portal":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "email":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    case "chatbot":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "phone":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    case "api":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20"
  }
}
