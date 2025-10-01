import { type User, mockUsers } from "./auth"
import { getAllTickets } from "./tickets"

export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  byPriority: {
    low: number
    medium: number
    high: number
    critical: number
  }
  byCategory: Record<string, number>
  avgResolutionTime: number
  responseTime: number
}

export interface UserStats {
  totalUsers: number
  employees: number
  agents: number
  admins: number
  activeUsers: number
}

export const getTicketStats = (): TicketStats => {
  const tickets = getAllTickets()

  const stats: TicketStats = {
    total: tickets.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    byCategory: {},
    avgResolutionTime: 0,
    responseTime: 0,
  }

  let totalResolutionTime = 0
  let resolvedCount = 0

  tickets.forEach((ticket) => {
    // Count by status
    stats[ticket.status as keyof typeof stats]++

    // Count by priority
    stats.byPriority[ticket.priority]++

    // Count by category
    stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1

    // Calculate resolution time for resolved tickets
    if (ticket.status === "resolved" || ticket.status === "closed") {
      const resolutionTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime()
      totalResolutionTime += resolutionTime
      resolvedCount++
    }
  })

  // Calculate average resolution time in hours
  if (resolvedCount > 0) {
    stats.avgResolutionTime = totalResolutionTime / resolvedCount / (1000 * 60 * 60)
  }

  // Mock response time (in production, this would be calculated from actual data)
  stats.responseTime = 2.4

  return stats
}

export const getUserStats = (): UserStats => {
  const users = mockUsers

  return {
    totalUsers: users.length,
    employees: users.filter((u) => u.role === "employee").length,
    agents: users.filter((u) => u.role === "agent").length,
    admins: users.filter((u) => u.role === "admin").length,
    activeUsers: users.length, // Mock: all users are active
  }
}

export const getAllUsers = (): User[] => {
  return mockUsers
}

export const createUser = (userData: Omit<User, "id" | "createdAt">): User => {
  const newUser: User = {
    ...userData,
    id: String(mockUsers.length + 1),
    createdAt: new Date(),
  }
  mockUsers.push(newUser)
  return newUser
}

export const updateUser = (userId: string, updates: Partial<User>): boolean => {
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
    return true
  }
  return false
}

export const deleteUser = (userId: string): boolean => {
  const userIndex = mockUsers.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    mockUsers.splice(userIndex, 1)
    return true
  }
  return false
}
