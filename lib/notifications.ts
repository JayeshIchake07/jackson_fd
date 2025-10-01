export interface Notification {
  id: string
  userId: string
  type: "ticket_update" | "ticket_assigned" | "ticket_resolved" | "message" | "system"
  title: string
  message: string
  ticketId?: string
  read: boolean
  createdAt: Date
  priority: "low" | "medium" | "high"
}

let notifications: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "ticket_update",
    title: "Ticket Updated",
    message: "Your ticket TKT-001 has been updated to In Progress",
    ticketId: "1",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: "medium",
  },
  {
    id: "notif-2",
    userId: "user-1",
    type: "message",
    title: "New Message",
    message: "Agent John Doe replied to your ticket TKT-001",
    ticketId: "1",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    priority: "high",
  },
  {
    id: "notif-3",
    userId: "user-1",
    type: "ticket_resolved",
    message: "Your ticket TKT-003 has been resolved",
    title: "Ticket Resolved",
    ticketId: "3",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    priority: "low",
  },
]

export const getNotifications = (userId: string): Notification[] => {
  return notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export const getUnreadCount = (userId: string): number => {
  return notifications.filter((n) => n.userId === userId && !n.read).length
}

export const markAsRead = (notificationId: string): void => {
  const notification = notifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

export const markAllAsRead = (userId: string): void => {
  notifications.forEach((n) => {
    if (n.userId === userId) {
      n.read = true
    }
  })
}

export const createNotification = (notification: Omit<Notification, "id" | "createdAt">): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date(),
  }
  notifications.push(newNotification)
  return newNotification
}

export const deleteNotification = (notificationId: string): void => {
  notifications = notifications.filter((n) => n.id !== notificationId)
}
