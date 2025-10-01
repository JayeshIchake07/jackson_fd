export type UserRole = "employee" | "agent" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock authentication - in production, this would connect to a real auth service
export const mockUsers: User[] = [
  {
    id: "1",
    email: "employee@powergrid.com",
    name: "John Employee",
    role: "employee",
    department: "IT Operations",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "agent@powergrid.com",
    name: "Sarah Agent",
    role: "agent",
    department: "IT Support",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    email: "admin@powergrid.com",
    name: "Mike Admin",
    role: "admin",
    department: "IT Management",
    createdAt: new Date("2024-01-01"),
  },
]

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock authentication logic
  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "password123") {
    return user
  }
  return null
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}
