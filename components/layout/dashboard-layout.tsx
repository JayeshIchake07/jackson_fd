"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedTicketForm } from "@/components/tickets/enhanced-ticket-form"
import { UnifiedTicketList } from "@/components/tickets/unified-ticket-list"
import { AgentTicketList } from "@/components/agent/agent-ticket-list"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserManagement } from "@/components/admin/user-management"
import { KnowledgeBase } from "@/components/knowledge-base/knowledge-base"
import { AIRoutingDashboard } from "@/components/admin/ai-routing-dashboard"
import { WorkflowBuilder } from "@/components/admin/workflow-builder"
// Analytics dashboard removed
import { EmployeeDashboard } from "@/components/employee/employee-dashboard"
import { AgentDashboard } from "@/components/agent/agent-dashboard"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LayoutDashboard,
  Ticket,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  Shield,
  Plus,
  UserCheck,
  Brain,
  GitBranch,
  BarChart3,
} from "lucide-react"

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "#", current: activeTab === "overview" },
    ...(user?.role === "employee"
      ? [{ name: "My Tickets", icon: Ticket, href: "#", current: activeTab === "tickets" }]
      : []),
    ...(user?.role === "agent"
      ? [{ name: "Manage Tickets", icon: UserCheck, href: "#", current: activeTab === "agent-tickets" }]
      : []),
    { name: "Knowledge Base", icon: BookOpen, href: "#", current: activeTab === "knowledge" },
    ...(user?.role === "admin"
      ? [
          
          { name: "Users", icon: Users, href: "#", current: activeTab === "users" },
          { name: "AI Routing", icon: Brain, href: "#", current: activeTab === "ai-routing" },
          { name: "Workflows", icon: GitBranch, href: "#", current: activeTab === "workflows" },
          { name: "Settings", icon: Settings, href: "#", current: activeTab === "settings" },
        ]
      : []),
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "agent":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "employee":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const handleNavClick = (tabName: string) => {
    setActiveTab(tabName)
    setSidebarOpen(false)
  }

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onCreateTicket: () => setActiveTab("tickets"),
    onNavigateToTab: setActiveTab,
    userRole: user?.role
  })

  // Listen for custom navigation events from chatbot
  useEffect(() => {
    const handleCustomNavigation = (event: CustomEvent) => {
      setActiveTab(event.detail)
    }

    window.addEventListener('navigate-to-tab', handleCustomNavigation as EventListener)
    
    return () => {
      window.removeEventListener('navigate-to-tab', handleCustomNavigation as EventListener)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
            <SidebarContent
              navigation={navigation}
              user={user}
              logout={logout}
              getRoleColor={getRoleColor}
              onNavClick={handleNavClick}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 py-4">
          <SidebarContent
            navigation={navigation}
            user={user}
            logout={logout}
            getRoleColor={getRoleColor}
            onNavClick={handleNavClick}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "tickets" && "My Tickets"}
                {activeTab === "agent-tickets" && "Manage Tickets"}
                
                {activeTab === "users" && "User Management"}
                {activeTab === "ai-routing" && "AI Classification & Routing"}
                {activeTab === "workflows" && "Workflow Automation"}
                {activeTab === "settings" && "System Settings"}
                {activeTab === "knowledge" && "Knowledge Base"}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              <NotificationCenter userId={user?.id || "user-1"} />
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-medium">{user?.name}</span>
                <Badge variant="outline" className={getRoleColor(user?.role || "")}>
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            {activeTab === "overview" &&
              (user?.role === "admin" ? (
                <AdminDashboard />
              ) : user?.role === "employee" ? (
                <EmployeeDashboard />
              ) : user?.role === "agent" ? (
                <AgentDashboard />
              ) : (
                <DashboardContent user={user} onCreateTicket={() => setActiveTab("tickets")} onNavigateToTab={setActiveTab} />
              ))}
            {activeTab === "tickets" && user?.role === "employee" && <TicketsContent />}
            {activeTab === "agent-tickets" && user?.role === "agent" && <AgentTicketsContent />}
            {/* Analytics dashboard removed */}
            {activeTab === "users" && user?.role === "admin" && <UserManagement />}
            {activeTab === "ai-routing" && user?.role === "admin" && <AIRoutingDashboard />}
            {activeTab === "workflows" && user?.role === "admin" && <WorkflowBuilder />}
            {activeTab === "settings" && user?.role === "admin" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configure system-wide settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Settings Coming Soon</h3>
                      <p className="text-muted-foreground">
                        Advanced system configuration options will be available here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === "knowledge" && <KnowledgeBase />}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navigation, user, logout, getRoleColor, onNavClick }: any) {
  return (
    <>
      <div className="flex items-center gap-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Fusion Desk</h1>
          <p className="text-xs text-muted-foreground">IT Service Management</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item: any) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      if (item.name === "Dashboard") onNavClick("overview")
                      if (item.name === "My Tickets") onNavClick("tickets")
                      if (item.name === "Manage Tickets") onNavClick("agent-tickets")
                      // Analytics navigation removed
                      if (item.name === "Users") onNavClick("users")
                      if (item.name === "AI Routing") onNavClick("ai-routing")
                      if (item.name === "Workflows") onNavClick("workflows")
                      if (item.name === "Settings") onNavClick("settings")
                      if (item.name === "Knowledge Base") onNavClick("knowledge")
                    }}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors w-full text-left ${
                      item.current
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-x-3 mb-2">
                <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{user?.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Badge variant="outline" className={`w-full justify-center ${getRoleColor(user?.role || "")}`}>
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <Button variant="ghost" className="w-full justify-start mt-2" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </li>
        </ul>
      </nav>
    </>
  )
}

function DashboardContent({ user, onCreateTicket, onNavigateToTab }: { user: any; onCreateTicket: () => void; onNavigateToTab: (tab: string) => void }) {
  const handleNavigateToKnowledgeBase = () => {
    onNavigateToTab("knowledge")
  }

  const handleNavigateToMyTickets = () => {
    onNavigateToTab("tickets")
  }

  // Analytics navigation removed

  const handleNavigateToUsers = () => {
    onNavigateToTab("users")
  }

  const handleNavigateToWorkflows = () => {
    onNavigateToTab("workflows")
  }

  const handleNavigateToAIRouting = () => {
    onNavigateToTab("ai-routing")
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
        <p className="text-muted-foreground">Here's what's happening with your IT service requests today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved This Month</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Great progress!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30m</div>
            <p className="text-xs text-muted-foreground">Faster than average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates on your tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">TKT-001 in progress</p>
                  <p className="text-xs text-muted-foreground">Network connectivity issues - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">TKT-003 resolved</p>
                  <p className="text-xs text-muted-foreground">Password reset completed - 1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">TKT-002 submitted</p>
                  <p className="text-xs text-muted-foreground">Software installation request - 2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={onCreateTicket}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Ticket
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleNavigateToKnowledgeBase}>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Knowledge Base
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleNavigateToMyTickets}>
                <Ticket className="mr-2 h-4 w-4" />
                View All My Tickets
              </Button>
              
              {/* Agent-specific Quick Actions */}
              {user?.role === "agent" && (
                <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => onNavigateToTab("agent-tickets")}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Manage Tickets
                </Button>
              )}

              {/* Admin-specific Quick Actions */}
              {user?.role === "admin" && (
                <>
                  {/* Analytics button removed */}
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleNavigateToUsers}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleNavigateToWorkflows}>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Workflow Builder
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleNavigateToAIRouting}>
                    <Brain className="mr-2 h-4 w-4" />
                    AI Routing
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TicketsContent() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">My Tickets</TabsTrigger>
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <UnifiedTicketList key={refreshKey} />
        </TabsContent>
        <TabsContent value="create" className="space-y-4">
          <EnhancedTicketForm onTicketCreated={() => setRefreshKey((prev) => prev + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AgentTicketsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ticket Management</h2>
        <p className="text-muted-foreground">Manage and resolve IT service requests from users.</p>
      </div>
      <AgentTicketList />
    </div>
  )
}
